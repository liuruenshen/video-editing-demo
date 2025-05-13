"use client";

import React from "react";
import { useImperativeHandle } from "react";
import { ClipsControl } from "./clipsControl";

type OnTimeUpdateCallback = (currentTime: number) => void;
export interface ClipsReviewPublicApi {
  play: () => void;
  pause: () => void;
  seek: (time: number, disableTimeUpdate?: boolean) => void;
  duration: () => number;
  installOnTimeUpdate: (callback: OnTimeUpdateCallback) => void;
  uninstallOnTimeUpdate: (callback: OnTimeUpdateCallback) => void;
}

interface ClipsPreviewProps {
  clipId: string;
  subtitleLanguage: string;
  ref: React.RefObject<ClipsReviewPublicApi | null>;
}

export function ClipsPreview({
  clipId,
  subtitleLanguage,
  ref,
}: ClipsPreviewProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const disableTimeUpdateRef = React.useRef<boolean>(false);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const onTimeUpdateRef = React.useRef<OnTimeUpdateCallback[]>([]);

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
        seek: (time: number, disableTimeUpdate: boolean = false) => {
          if (!videoRef.current) {
            return;
          }
          videoRef.current.currentTime = time;
          if (disableTimeUpdate) {
            disableTimeUpdateRef.current = true;
          }
        },
        duration: () => {
          if (!videoRef.current) {
            return 0;
          }

          return videoRef.current.duration;
        },
        installOnTimeUpdate: (callback: (currentTime: number) => void) => {
          onTimeUpdateRef.current.push(callback);
        },
        uninstallOnTimeUpdate: (callback: (currentTime: number) => void) => {
          onTimeUpdateRef.current = onTimeUpdateRef.current.filter(
            (cb) => cb !== callback
          );
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
        onPlay={() => {
          setIsPlaying(true);
        }}
        onPause={() => {
          setIsPlaying(false);
        }}
        onTimeUpdate={() => {
          if (disableTimeUpdateRef.current) {
            disableTimeUpdateRef.current = false;
            return;
          }

          onTimeUpdateRef.current.forEach((callback) => {
            if (videoRef.current) callback(videoRef.current.currentTime);
          });
        }}
      >
        <track
          kind="subtitles"
          src={`/api/clip/${clipId}/vtt?lang=${subtitleLanguage}`}
          srcLang={subtitleLanguage}
          default
        />
        Your browser does not support the video tag.
      </video>
      <ClipsControl ref={ref} isPlaying={isPlaying} />
    </div>
  );
}
