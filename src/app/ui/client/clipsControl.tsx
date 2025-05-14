"use client";

import { MdOutlinePlayCircleFilled } from "react-icons/md";
import { MdOutlineSkipNext } from "react-icons/md";
import { MdOutlineSkipPrevious } from "react-icons/md";
import { MdOutlinePause } from "react-icons/md";
import { ClipsReviewPublicApi } from "./clipsPreview";
import { secondsToTimestamp } from "@/app/client-server/utils";
import { SelectedTimeLine, Timeline } from "./timeline";
import clsx from "clsx";
import { useCallback, useImperativeHandle } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export interface ClipsControlPublicApi {
  ended: () => void;
}

interface ClipsControlProps {
  parentRef: React.RefObject<ClipsReviewPublicApi | null>;
  controlRef: React.RefObject<ClipsControlPublicApi | null>;
  isPlaying: boolean;
  selectedTimeline: SelectedTimeLine[];
  currentTime: number;
  clipListIds: string[];
  clipId: string;
}

export function ClipsControl({
  controlRef,
  parentRef,
  isPlaying,
  selectedTimeline,
  currentTime,
  clipListIds,
  clipId,
}: ClipsControlProps) {
  const searchParams = useSearchParams();

  const route = useRouter();

  const duration = parentRef.current?.duration() ?? 0;

  const isFirstClip = clipListIds[0] === clipId;
  const isLastClip = clipListIds[clipListIds.length - 1] === clipId;

  const nextClip = useCallback(() => {
    if (isLastClip) return;
    const index = clipListIds.indexOf(clipId);
    if (index === -1) return;

    const searchDictionary = Object.fromEntries(searchParams.entries());
    const newSearchParam = new URLSearchParams(searchDictionary);
    route.replace(
      `/clip-editing/${clipListIds[index + 1]}?${newSearchParam.toString()}`
    );
  }, [isLastClip, clipListIds, searchParams, route, clipId]);

  useImperativeHandle(
    controlRef,
    () => {
      return {
        ended: () => {
          nextClip();
        },
      };
    },
    [nextClip]
  );

  const previousClip = () => {
    if (isFirstClip) return;
    const index = clipListIds.indexOf(clipId);
    if (index < 1) return;

    const searchDictionary = Object.fromEntries(searchParams.entries());
    const newSearchParam = new URLSearchParams(searchDictionary);
    route.replace(
      `/clip-editing/${clipListIds[index - 1]}?${newSearchParam.toString()}`
    );
  };

  return (
    <div className="w-full grid grid-rows-2 justify-stretch items-center p-1 gap-3 mb-2">
      <div className="flex flex-row justify-between items-center w-full">
        <div>
          <MdOutlineSkipPrevious
            size={40}
            className={clsx({
              "fill-gray-500": isFirstClip,
              "cursor-pointer": !isFirstClip,
            })}
            onClick={previousClip}
          />
        </div>
        <div
          className="[&_svg:hover]:fill-blue-300 cursor-pointer"
          onClick={() => {
            if (isPlaying) {
              parentRef.current?.pause();
            } else {
              parentRef.current?.play();
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
          <MdOutlineSkipNext
            size={40}
            className={clsx({
              "fill-gray-500": isLastClip,
              "cursor-pointer": !isLastClip,
            })}
            onClick={nextClip}
          />
        </div>
        <div className="text-white text-xl font-semibold">
          {`${secondsToTimestamp(currentTime)} / ${secondsToTimestamp(
            parentRef.current?.duration() ?? 0
          )}`}
        </div>
      </div>
      <Timeline
        selectedLines={selectedTimeline}
        duration={duration}
        currentTime={currentTime}
        ref={parentRef}
      />
    </div>
  );
}
