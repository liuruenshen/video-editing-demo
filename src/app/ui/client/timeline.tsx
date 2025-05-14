import { MouseEventHandler } from "react";
import { ClipsReviewPublicApi } from "./clipsPreview";

export interface SelectedTimeLine {
  start: number;
  end: number;
}

interface TimelineProps {
  selectedLines: SelectedTimeLine[];
  duration: number;
  currentTime: number;
  ref: React.RefObject<ClipsReviewPublicApi | null>;
}

export function Timeline({
  selectedLines,
  duration,
  currentTime,
  ref,
}: TimelineProps) {
  const selectedLineElements = selectedLines.map((line) => {
    const width = ((line.end - line.start) / duration) * 100;
    const left = (line.start / duration) * 100;
    return (
      <div
        key={line.start}
        className={`h-full bg-blue-600 absolute`}
        style={{
          width: `${width}%`,
          left: `${left}%`,
        }}
      ></div>
    );
  });

  const seek: MouseEventHandler<HTMLDivElement> = (e) => {
    const width = e.currentTarget.clientWidth;
    const { x: elementViewportLeft } = e.currentTarget.getBoundingClientRect();
    const offsetLeft = e.clientX - elementViewportLeft;

    if (offsetLeft < 0) return;

    const time = (offsetLeft / width) * duration;
    ref.current?.seek(time);
  };

  return (
    <div
      onClick={seek}
      className="flex flex-row w-full relative h-9 rounded-md bg-slate-400 cursor-pointer"
    >
      {duration === 0 ? (
        <div className="m-auto text-slate-800">Press play to start</div>
      ) : null}
      {duration !== 0 ? selectedLineElements : null}
      {duration !== 0 ? (
        <div
          className="absolute bg-red-600 h-full w-1 top-0"
          style={{
            left: `${(currentTime / duration) * 100}%`,
          }}
        ></div>
      ) : null}
    </div>
  );
}
