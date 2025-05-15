"use server";

import { redirect } from "next/navigation";
import { MOCK_CLIP_LIST_ID } from "../client-server/const";
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
   * We don't actually upload the file here, because it is a demo with some mock apis.
   */
  await makeVideoIdFolder();

  redirect(`/clip-list/${MOCK_CLIP_LIST_ID}`);
}
