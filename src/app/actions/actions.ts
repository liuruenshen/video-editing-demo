"use server";

import { redirect } from "next/navigation";
import { makeVideoIdFolder } from "../lib/clips";

export async function uploadVideo(form: FormData) {
  const file = form.get("upload-video") as File;

  if (typeof file.type !== "string" || typeof file.size !== "number") {
    throw new Error("Invalid file type or size.");
  }

  if (!file.type.includes("video/")) {
    throw new Error("Please upload a valid video file.");
  }

  /**
   * This is a video editing demo, so we are not actually uploading the video to a server.
   * Instead, we are creating a folder to pretend to upload the video to.
   */
  const videoFolder = makeVideoIdFolder();

  redirect(`/video-editing/${videoFolder}`);
}
