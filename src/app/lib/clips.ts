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
  mkdirSync(videoFolderPath);

  return videoFolder;
}

export function isValidVideoId(clipId: string) {
  const videoPath = getVideoClipsPath(clipId);
  const result = statSync(videoPath);

  return result.isDirectory();
}

export function isValidClipListId(clipListId: string) {
  const clipListPath = getClipListPath(clipListId);
  const result = statSync(clipListPath);
  return result.isDirectory();
}

export function getClipList(clipListId: string): string[] {
  if (!isValidClipListId(clipListId)) {
    return [];
  }

  const clipListPath = getClipListPath(clipListId);
  const file = path.resolve(clipListPath, "metadata.json");
  const content = readFileSync(file, "utf-8");
  const metadata = JSON.parse(content);
  if ("clipIds" in metadata && Array.isArray(metadata.clipIds)) {
    return metadata.clipIds as string[];
  }

  return [];
}

export function getClipMetadata(clipId: string): ClipMetaData | null {
  if (!isValidVideoId(clipId)) {
    return null;
  }

  const clipFolderPath = getVideoClipsPath(clipId);
  const jsonPath = path.join(clipFolderPath, "metadata.json");

  const content = readFileSync(jsonPath, "utf-8");

  return JSON.parse(content);
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

  const clipPath = path.resolve(clipFolderPath, metadata.filename);
  return statSync(clipPath);
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
