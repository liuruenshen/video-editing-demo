"use client";

import { MdOutlinePlayCircleFilled } from "react-icons/md";
import { MdOutlineSkipNext } from "react-icons/md";
import { MdOutlineSkipPrevious } from "react-icons/md";
import { MdOutlinePause } from "react-icons/md";
import { ClipsReviewPublicApi } from "./clipsPreview";
import { secondsToTimestamp } from "@/app/client-server/utils";
import { SelectedTimeLine, Timeline } from "./timeline";

interface ClipsControlProps {
  ref: React.RefObject<ClipsReviewPublicApi | null>;
  isPlaying: boolean;
  selectedTimeline: SelectedTimeLine[];
  currentTime: number;
}

export function ClipsControl({
  ref,
  isPlaying,
  selectedTimeline,
  currentTime,
}: ClipsControlProps) {
  const duration = ref.current?.duration() ?? 0;

  return (
    <div className="w-full grid grid-rows-2 justify-stretch items-center p-1 gap-3 mb-2">
      <div className="flex flex-row justify-between items-center w-full">
        <div>
          <MdOutlineSkipPrevious size={40} />
        </div>
        <div
          className="[&_svg:hover]:fill-blue-300 cursor-pointer"
          onClick={() => {
            if (isPlaying) {
              ref.current?.pause();
            } else {
              ref.current?.play();
            }
          }}
        >
          {isPlaying ? (
            <MdOutlinePause size={40} />
          ) : (
            <MdOutlinePlayCircleFilled size={40} />
          )}
        </div>
        <div>
          <MdOutlineSkipNext size={40} />
        </div>
        <div className="text-white text-xl font-semibold">
          {`${secondsToTimestamp(currentTime)} / ${secondsToTimestamp(
            ref.current?.duration() ?? 0
          )}`}
        </div>
      </div>
      <Timeline
        selectedLines={selectedTimeline}
        duration={duration}
        currentTime={currentTime}
      />
    </div>
  );
}
