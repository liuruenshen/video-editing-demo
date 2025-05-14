import { createReadStream, mkdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { ClipMetaData } from "../client-server/const";
import { list } from "@vercel/blob";
import { Readable } from "node:stream";

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

export function makeVideoIdFolder() {
  const videoFolder = Math.random().toString(36).substring(2, 12);
  const videoFolderPath = getVideoClipsPath(videoFolder);
  try {
    mkdirSync(videoFolderPath);
  } catch {
    throw new Error("Failed to create video folder");
  }

  return videoFolder;
}

export async function isValidVideoId(clipId: string) {
  const videoPath = getVideoClipsPath(clipId);

  if (process.env.IS_VERCEL_CLOUD === "1") {
    const result = await list({
      prefix: videoPath,
    });
    return !!result.blobs.find((item) => item.pathname === `${videoPath}/`);
  }

  try {
    const result = statSync(videoPath);
    return result.isDirectory();
  } catch {
    throw new Error("Invalid Clip ID");
  }
}

export async function isValidClipListId(clipListId: string) {
  const clipListPath = getClipListPath(clipListId);
  if (process.env.IS_VERCEL_CLOUD === "1") {
    const result = await list({
      prefix: clipListPath,
    });
    return !!result.blobs.find((item) => item.pathname === `${clipListPath}/`);
  }

  try {
    const result = statSync(clipListPath);
    return result.isDirectory();
  } catch {
    throw new Error("Invalid Clip List ID");
  }
}

export async function getClipList(clipListId: string): Promise<string[]> {
  if (!(await isValidClipListId(clipListId))) {
    return [];
  }

  const clipListPath = getClipListPath(clipListId);

  if (process.env.IS_VERCEL_CLOUD === "1") {
    const result = await list({
      prefix: clipListPath,
    });

    const foundItem = result.blobs.find(
      (item) => item.pathname === `${clipListPath}/metadata.json`
    );

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

export async function getClipMetadata(
  clipId: string
): Promise<ClipMetaData | null> {
  if (!(await isValidVideoId(clipId))) {
    return null;
  }

  const clipFolderPath = getVideoClipsPath(clipId);

  if (process.env.IS_VERCEL_CLOUD === "1") {
    const result = await list({
      prefix: clipFolderPath,
    });

    const foundItem = result.blobs.find(
      (item) => item.pathname === `${clipFolderPath}/metadata.json`
    );

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

export async function getClipSize(clipId: string) {
  const clipFolderPath = getVideoClipsPath(clipId);
  if (!clipFolderPath) {
    return null;
  }

  const metadata = await getClipMetadata(clipId);
  if (!metadata) {
    return null;
  }

  if (process.env.IS_VERCEL_CLOUD === "1") {
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

async function getClipStreamOnVercelCloud(
  clipId: string,
  range: { start: number; end: number }
) {
  const clipFolderPath = getVideoClipsPath(clipId);

  const metadata = await getClipMetadata(clipId);
  if (!metadata) {
    return null;
  }

  const result = await list({
    prefix: `${clipFolderPath}/${metadata.filename}`,
  });

  if (!result.blobs[0]) {
    return null;
  }

  const [foundItem] = result.blobs;

  const response = await fetch(foundItem.url, {
    headers: {
      Range: `bytes=${range.start}-${range.end}`,
    },
  });

  if (!response.ok) {
    return null;
  }

  return response.body;
}

interface Range {
  start: number;
  end: number;
}

export async function getClipStream(clipId: string, options?: Range) {
  if (process.env.IS_VERCEL_CLOUD === "1") {
    return getClipStreamOnVercelCloud(clipId, {
      start: options?.start ?? 0,
      end: options?.end ?? 0,
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
  const readStream = createReadStream(clipPath, options);
  if (!readStream) {
    return null;
  }

  /**
   * https://exploringjs.com/nodejs-shell-scripting/ch_web-streams.html#example-reading-a-file-via-a-readablestream
   */
  return Readable.toWeb(readStream);
}
