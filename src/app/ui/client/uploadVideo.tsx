"use client";

import React, { useActionState, useEffect } from "react";
import { uploadVideo } from "../../actions/actions";
import Link from "next/link";
import { MOCK_CLIP_LIST_ID } from "@/app/client-server/const";
import { LiaSpinnerSolid } from "react-icons/lia";

export function UploadVideo() {
  const [uploadingVideoUrl, setUploadingVideoUrl] = React.useState<
    string | null
  >(null);
  const [alert, setAlert] = React.useState("");
  const [state, dispatch, pending] = useActionState(uploadVideo, {
    message: "",
  });

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { files } = event.target;
    const file = files?.[0];
    if (!file) return;

    if (uploadingVideoUrl) {
      URL.revokeObjectURL(uploadingVideoUrl);
      setUploadingVideoUrl(null);
    }

    if (file.size > 4 * 1024 * 1024) {
      setAlert("File size exceeds 4MB.");
      return;
    }

    if (!file.type.includes("video/")) {
      setAlert("Please upload a valid video file.");
      return;
    }

    setAlert("");
    const url = URL.createObjectURL(file);

    setUploadingVideoUrl(url);
  }

  useEffect(() => {
    if (state.message) {
      setAlert(state.message);
    } else {
      setAlert("");
    }
  }, [state.message]);

  return (
    <div className="w-full h-full flex items-center justify-center flex-col lg:flex-row text-lg lg:text-2xl gap-6 p-4">
      {uploadingVideoUrl ? (
        <video
          className="w-full min-w-0 max-w-full h-[30vh] rounded-md"
          src={uploadingVideoUrl}
          controls
        ></video>
      ) : (
        <div className="bg-gray-300 h-[30vh] p-4 w-full rounded-md flex items-center justify-center">
          <span>Selected Video Preview</span>
        </div>
      )}
      <div className="w-full flex flex-col items-center gap-1">
        <form className="w-full flex flex-col gap-3" action={dispatch}>
          <label htmlFor="upload-video" className="text-2xl md:text-4xl mb-2 ">
            {"Upload a video to edit"}
          </label>
          <div className="text-lg">The file size must not exceed 4mb</div>
          <input
            type="file"
            id="upload-video"
            name="upload-video"
            accept="video/*"
            className="bg-blue-200 rounded-sm px-2 py-2 cursor-pointer text-xl hover:bg-sky-300"
            onChange={handleFileChange}
          />
          {alert && (
            <div className="text-white bg-red-500 rounded-lg px-2 text-lg md:text-xl">
              {alert}
            </div>
          )}
          <button
            type="submit"
            className="bg-blue-500 text-white rounded-lg flex items-center justify-center px-4 py-3 text-xl md:text-2xl cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={!uploadingVideoUrl || !!alert || pending}
          >
            {pending ? (
              <LiaSpinnerSolid size={40} className="animate-spin" />
            ) : (
              <span>Upload Video</span>
            )}
          </button>
        </form>
        <div className="w-full relative m-2">
          <hr className="h-2 w-full mt-4" />
          <span className="text-lg absolute left-[50%] top-0 bg-white rounded-full p-2 translate-x-[-50%] translate-y-[-10%]">
            OR
          </span>
        </div>
        <Link
          href={`/clip-list/${MOCK_CLIP_LIST_ID}`}
          className="bg-blue-600 text-white rounded-md py-2 px-4 mt-4 cursor-pointer"
        >
          Go to the clips demo
        </Link>
      </div>
    </div>
  );
}
