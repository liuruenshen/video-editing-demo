"use client";

import React from "react";

export function UploadVideo() {
  const [uploadingVideoUrl, setUploadingVideoUrl] = React.useState<
    string | null
  >(null);
  const [alert, setAlert] = React.useState("");

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { files } = event.target;
    const file = files?.[0];
    if (!file) return;

    if (uploadingVideoUrl) {
      URL.revokeObjectURL(uploadingVideoUrl);
      setUploadingVideoUrl(null);
    }

    if (!file.type.includes("video/")) {
      setAlert("Please upload a valid video file.");
      return;
    }

    setAlert("");
    const url = URL.createObjectURL(file);

    setUploadingVideoUrl(url);
  }

  return (
    <div className="w-full h-full flex items-center justify-center flex-col md:flex-row text-lg md:text-2xl gap-6">
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
      <form className="w-full flex flex-col gap-3">
        <label htmlFor="upload-video" className="text-2xl md:text-4xl mb-2 ">
          Upload a video to edit
        </label>
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
          className="bg-blue-500 text-white rounded-lg px-4 py-3 text-xl md:text-2xl cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={!uploadingVideoUrl || !!alert}
        >
          Submit
        </button>
      </form>
    </div>
  );
}
