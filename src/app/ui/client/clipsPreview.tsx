"use client";

import React from "react";
import { useImperativeHandle } from "react";

export interface ClipsReviewPublicApi {
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
}

interface ClipsPreviewProps {
  clipId: string;
  subtitleLanguage: string;
  ref: React.Ref<ClipsReviewPublicApi>;
}

export function ClipsPreview({
  clipId,
  subtitleLanguage,
  ref,
}: ClipsPreviewProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);

  useImperativeHandle(
    ref,
    () => {
      return {
        play: () => {
          videoRef.current?.play();
        },
        pause: () => {
          videoRef.current?.pause();
        },
        seek: (time: number) => {
          if (!videoRef.current) {
            return;
          }
          videoRef.current.currentTime = time;
        },
      };
    },
    []
  );

  return (
    <div className="bg-slate-900 flex h-full flex-col justify-start items-start text-white p-2 w-full gap-1">
      <h2 className="text-xl lg:text-2xl">Preview</h2>
      <video
        src={`/api/clip/${clipId}`}
        className="w-full min-h-[20vh] max-h-[40vh]"
        controls={true}
        ref={videoRef}
      >
        <track
          kind="subtitles"
          src={`/api/clip/${clipId}/vtt?lang=${subtitleLanguage}`}
          srcLang={subtitleLanguage}
          default
        />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
