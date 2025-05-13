"use client";

import { getDisplayedTime } from "@/app/lib/utils";
import { ClipMetaData } from "@/app/client-server/const";
import clsx from "clsx";

type ArrayElement<T> = T extends Array<infer U> ? U : never;

interface TranscriptSectionProps {
  transcriptSections: ArrayElement<ClipMetaData["transcriptSections"]>;
}

export function TranscriptSection({
  transcriptSections,
}: TranscriptSectionProps) {
  return (
    <div className="flex flex-col gap-1" key={transcriptSections.title}>
      <h3 className="text-xl font-semibold mb-1">{transcriptSections.title}</h3>
      <ol className="[list-style-type:none] space-y-2">
        {transcriptSections.tracks.map((track) => {
          return (
            <li
              key={track.startTime}
              className={clsx("rounded-md p-2", {
                "bg-cyan-200": track.highlight,
                "bg-white": !track.highlight,
              })}
            >
              <div className="flex flex-row items-center justify-start gap-3">
                <span className="text-blue-500 font-bold">
                  {getDisplayedTime(track.startTime)}
                </span>
                <pre>{track.text}</pre>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
