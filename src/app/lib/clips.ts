import { createReadStream, mkdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { ClipMetaData } from "../client-server/const";
import { list, createFolder, head } from "@vercel/blob";
import { Readable } from "node:stream";
import { cache } from "react";
import { getCachedClipMetadata } from "./getCachedClipMetadata";

function getVideoClipsPath(clipId: string) {
  if (process.env.IS_VERCEL_CLOUD === "1") {
    return `videoClips/${clipId}`;
  }

  const url = new URL(import.meta.url);
  return path.resolve(
    path.dirname(url.pathname),
    "../../../videoClips/",
    clipId
  );
}

function getClipListPath(clipListId: string) {
  if (process.env.IS_VERCEL_CLOUD === "1") {
    return `clipList/${clipListId}`;
  }

  const url = new URL(import.meta.url);
  return path.resolve(
    path.dirname(url.pathname),
    "../../../clipList/",
    clipListId
  );
}

export async function makeVideoIdFolder() {
  const videoFolder = Math.random().toString(36).substring(2, 12);
  if (process.env.IS_VERCEL_CLOUD === "1") {
    await createFolder(`videoClips/${videoFolder}/`);
    return videoFolder;
  }

  const videoFolderPath = getVideoClipsPath(videoFolder);
  try {
    mkdirSync(videoFolderPath);
  } catch {
    throw new Error("Failed to create video folder");
  }

  return videoFolder;
}

async function _isValidVideoId(clipId: string) {
  const videoPath = getVideoClipsPath(clipId);

  if (process.env.IS_VERCEL_CLOUD === "1") {
    try {
      console.log("Simple Operation in _isValidVideoId");
      await head(`${videoPath}/`);
      return true;
    } catch {
      return false;
    }
  }

  try {
    const result = statSync(videoPath);
    return result.isDirectory();
  } catch {
    throw new Error("Invalid Clip ID");
  }
}

export const isValidVideoId = cache(_isValidVideoId);

async function _isValidClipListId(clipListId: string) {
  const clipListPath = getClipListPath(clipListId);
  if (process.env.IS_VERCEL_CLOUD === "1") {
    try {
      console.log("Simple Operation in _isValidClipListId");
      await head(`${clipListPath}/`);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  try {
    const result = statSync(clipListPath);
    return result.isDirectory();
  } catch {
    throw new Error("Invalid Clip List ID");
  }
}

export const isValidClipListId = cache(_isValidClipListId);

async function _getClipList(clipListId: string): Promise<string[]> {
  if (!(await isValidClipListId(clipListId))) {
    return [];
  }

  const clipListPath = getClipListPath(clipListId);

  if (process.env.IS_VERCEL_CLOUD === "1") {
    console.log("Advanced Operation in _getClipList");
    const result = await list({
      prefix: `${clipListPath}/metadata.json`,
    });

    const foundItem = result.blobs[0];
    if (!foundItem) {
      return [];
    }

    try {
      const response = await fetch(foundItem.url);
      const metadata = await response.json();

      if ("clipIds" in metadata && Array.isArray(metadata.clipIds)) {
        return metadata.clipIds as string[];
      }
    } catch {
      return [];
    }

    return [];
  }

  try {
    const file = path.resolve(clipListPath, "metadata.json");
    const content = readFileSync(file, "utf-8");
    const metadata = JSON.parse(content);
    if ("clipIds" in metadata && Array.isArray(metadata.clipIds)) {
      return metadata.clipIds as string[];
    }
  } catch {
    return [];
  }

  return [];
}

export const getClipList = cache(_getClipList);

async function _getClipMetadata(clipId: string): Promise<ClipMetaData | null> {
  if (!(await isValidVideoId(clipId))) {
    return null;
  }

  const clipFolderPath = getVideoClipsPath(clipId);

  if (process.env.IS_VERCEL_CLOUD === "1") {
    console.log("Advanced Operation in _getClipMetadata");
    const result = await list({
      prefix: `${clipFolderPath}/metadata.json`,
    });

    const foundItem = result.blobs[0];
    if (!foundItem) {
      throw new Error("Clip not found");
    }

    try {
      const response = await fetch(foundItem.url);
      return await response.json();
    } catch {
      throw new Error("Failed to read clip metadata");
    }
  }

  try {
    const jsonPath = path.join(clipFolderPath, "metadata.json");

    const content = readFileSync(jsonPath, "utf-8");
    return JSON.parse(content);
  } catch {
    throw new Error("Failed to read clip metadata");
  }
}

export const getClipMetadata = cache(_getClipMetadata);

async function _getClipSize(clipId: string) {
  const clipFolderPath = getVideoClipsPath(clipId);
  if (!clipFolderPath) {
    return null;
  }

  const metadata = await getClipMetadata(clipId);
  if (!metadata) {
    return null;
  }

  if (process.env.IS_VERCEL_CLOUD === "1") {
    console.log("Advanced Operation in _getClipSize");
    const result = await list({
      prefix: `${clipFolderPath}/${metadata.filename}`,
    });

    const [foundItem] = result.blobs;
    if (!foundItem) {
      return null;
    }

    try {
      const response = await fetch(foundItem.url, {
        headers: {
          Range: `bytes=0-`,
        },
      });

      const size = response.headers.get("Content-Length");
      return Number(size);
    } catch {
      throw new Error("Failed to get the clip stat");
    }
  }

  try {
    const clipPath = path.resolve(clipFolderPath, metadata.filename);
    const statInfo = statSync(clipPath);
    return statInfo.size;
  } catch {
    throw new Error("Failed to get the clip stat");
  }
}

export const getClipSize = cache(_getClipSize);

interface GetClipStreamOptions {
  start: number;
  end: number;
  url: string;
}

async function getClipStreamOnVercelCloud(
  clipId: string,
  options: GetClipStreamOptions
) {
  const clipFolderPath = getVideoClipsPath(clipId);

  let metadata: ClipMetaData | null = null;

  if (options.url) {
    metadata = await getCachedClipMetadata(clipId, options.url);
  } else {
    metadata = await getClipMetadata(clipId);
  }

  if (!metadata) {
    return null;
  }

  console.log("Advanced Operation in getClipStreamOnVercelCloud");
  const result = await list({
    prefix: `${clipFolderPath}/${metadata.filename}`,
  });

  const [foundItem] = result.blobs;
  if (!foundItem) {
    return null;
  }

  const response = await fetch(foundItem.url, {
    headers: {
      Range: `bytes=${options.start}-${options.end}`,
    },
  });

  if (!response.ok) {
    return null;
  }

  return response.body;
}

export async function getClipStream(
  clipId: string,
  options?: GetClipStreamOptions
) {
  if (process.env.IS_VERCEL_CLOUD === "1") {
    return getClipStreamOnVercelCloud(clipId, {
      start: options?.start ?? 0,
      end: options?.end ?? 0,
      url: options?.url ?? "",
    });
  }

  const clipFolderPath = getVideoClipsPath(clipId);
  if (!clipFolderPath) {
    return null;
  }

  const metadata = await getClipMetadata(clipId);
  if (!metadata) {
    return null;
  }

  const clipPath = path.resolve(clipFolderPath, metadata.filename);
  const readStream = createReadStream(clipPath, {
    start: options?.start,
    end: options?.end,
  });
  if (!readStream) {
    return null;
  }

  /**
   * https://exploringjs.com/nodejs-shell-scripting/ch_web-streams.html#example-reading-a-file-via-a-readablestream
   */
  return Readable.toWeb(readStream);
}
