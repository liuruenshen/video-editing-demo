"use client";

import { getDisplayedTime } from "@/app/client-server/utils";
import { ClipMetaData } from "@/app/client-server/const";
import clsx from "clsx";
import { getTranscriptTrackId } from "@/app/hook/useSyncTranscripts";

type ArrayElement<T> = T extends Array<infer U> ? U : never;

export type SubtitleTrack = ArrayElement<
  ArrayElement<ClipMetaData["transcriptSections"]>["tracks"]
>;

interface TranscriptSectionProps {
  transcriptSections: ArrayElement<ClipMetaData["transcriptSections"]>;
  onClick?: (track: SubtitleTrack) => void;
  onTimestampClick?: (timestamp: string) => void;
  selectedLines: Set<string>;
}

export function TranscriptSection({
  transcriptSections,
  onClick,
  onTimestampClick,
  selectedLines,
}: TranscriptSectionProps) {
  return (
    <div className="flex flex-col gap-1" key={transcriptSections.title}>
      <h3 className="text-xl font-semibold mb-1">{transcriptSections.title}</h3>
      <ol className="[list-style-type:none] space-y-2">
        {transcriptSections.tracks.map((track) => {
          return (
            <li
              key={track.startTime}
              id={getTranscriptTrackId(track.startTime)}
              className={clsx(
                "rounded-md p-2 hover:bg-amber-200 cursor-pointer [&[data-current-line]]:border-amber-300 [&[data-current-line]]:border-4",
                {
                  "bg-cyan-200": selectedLines.has(track.startTime),
                  "bg-white": !selectedLines.has(track.startTime),
                }
              )}
              onClick={() => {
                onClick?.(track);
              }}
            >
              <div className="flex flex-row items-center justify-start gap-3">
                <span
                  className="text-blue-500 font-bold hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTimestampClick?.(track.startTime);
                  }}
                >
                  {getDisplayedTime(track.startTime)}
                </span>
                <pre className="flex-1 px-2 whitespace-pre-wrap">
                  {track.text}
                </pre>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
