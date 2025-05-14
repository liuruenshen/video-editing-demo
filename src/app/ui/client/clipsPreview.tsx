"use client";

import React from "react";
import { useImperativeHandle } from "react";
import { ClipsControl, ClipsControlPublicApi } from "./clipsControl";
import { SelectedTimeLine } from "./timeline";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export interface ClipsReviewPublicApi {
  play: () => void;
  pause: () => void;
  seek: (time: number, disableTimeUpdate?: boolean) => void;
  duration: () => number;
}

interface ClipsPreviewProps {
  clipId: string;
  subtitleLanguage: string;
  ref: React.RefObject<ClipsReviewPublicApi | null>;
  selectedTimeline: SelectedTimeLine[];
  onTimeUpdate?: (currentTime: number) => void;
  clipListIds: string[];
}

export function ClipsPreview({
  clipId,
  subtitleLanguage,
  ref,
  selectedTimeline,
  onTimeUpdate,
  clipListIds,
}: ClipsPreviewProps) {
  const route = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const searchDictionary = Object.fromEntries(searchParams.entries());

  const videoRef = React.useRef<HTMLVideoElement>(null);
  const disableTimeUpdateRef = React.useRef<boolean>(false);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const controlRef = React.useRef<ClipsControlPublicApi | null>(null);

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
        onCanPlay={() => {
          if (searchDictionary.play === "1") {
            videoRef.current?.play();
          }
        }}
        onPlay={() => {
          const newSearchParams = { ...searchDictionary };
          /**
           * This parameter instructs the app to start playing the clip when switching between clips, it does not
           * mean the clip is playing.
           */
          newSearchParams.play = "1";
          const query = new URLSearchParams(newSearchParams).toString();
          route.replace(`${pathname}?${query}`);
          setIsPlaying(true);
        }}
        onPause={() => {
          const newSearchParams = { ...searchDictionary };
          delete newSearchParams.play;
          const query = new URLSearchParams(newSearchParams).toString();
          route.replace(`${pathname}?${query}`);
          setIsPlaying(false);
        }}
        onEnded={() => {
          controlRef.current?.ended();
        }}
        onTimeUpdate={() => {
          if (disableTimeUpdateRef.current) {
            disableTimeUpdateRef.current = false;
            return;
          }
          const currentTime = videoRef.current?.currentTime ?? 0;
          setCurrentTime(currentTime);
          onTimeUpdate?.(currentTime);
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
      <ClipsControl
        controlRef={controlRef}
        parentRef={ref}
        isPlaying={isPlaying}
        selectedTimeline={selectedTimeline}
        currentTime={currentTime}
        clipListIds={clipListIds}
        clipId={clipId}
      />
    </div>
  );
}
