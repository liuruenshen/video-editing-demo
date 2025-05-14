import { createReadStream, mkdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { ClipMetaData } from "../client-server/const";

function getVideoClipsPath(clipId: string) {
  const url = new URL(import.meta.url);
  return path.resolve(
    path.dirname(url.pathname),
    "../../../videoClips/",
    clipId
  );
}

function getClipListPath(clipListId: string) {
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

export function isValidVideoId(clipId: string) {
  try {
    const videoPath = getVideoClipsPath(clipId);
    const result = statSync(videoPath);

    return result.isDirectory();
  } catch {
    throw new Error("Invalid Clip ID");
  }
}

export function isValidClipListId(clipListId: string) {
  try {
    const clipListPath = getClipListPath(clipListId);
    const result = statSync(clipListPath);
    return result.isDirectory();
  } catch {
    throw new Error("Invalid Clip List ID");
  }
}

export function getClipList(clipListId: string): string[] {
  if (!isValidClipListId(clipListId)) {
    return [];
  }

  const clipListPath = getClipListPath(clipListId);

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

export function getClipMetadata(clipId: string): ClipMetaData | null {
  if (!isValidVideoId(clipId)) {
    return null;
  }

  try {
    const clipFolderPath = getVideoClipsPath(clipId);
    const jsonPath = path.join(clipFolderPath, "metadata.json");

    const content = readFileSync(jsonPath, "utf-8");
    return JSON.parse(content);
  } catch {
    throw new Error("Failed to read clip metadata");
  }
}

export function getClipStat(clipId: string) {
  const clipFolderPath = getVideoClipsPath(clipId);
  if (!clipFolderPath) {
    return null;
  }

  const metadata = getClipMetadata(clipId);
  if (!metadata) {
    return null;
  }

  try {
    const clipPath = path.resolve(clipFolderPath, metadata.filename);
    return statSync(clipPath);
  } catch {
    throw new Error("Failed to get the clip stat");
  }
}

type CreateReadStreamOption = Parameters<typeof createReadStream>[1];

export function getClipStream(
  clipId: string,
  options?: CreateReadStreamOption
) {
  const clipFolderPath = getVideoClipsPath(clipId);
  if (!clipFolderPath) {
    return null;
  }

  const metadata = getClipMetadata(clipId);
  if (!metadata) {
    return null;
  }

  const clipPath = path.resolve(clipFolderPath, metadata.filename);
  return createReadStream(clipPath, options);
}
