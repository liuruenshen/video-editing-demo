export interface SelectedTimeLine {
  start: number;
  end: number;
}

interface TimelineProps {
  selectedLines: SelectedTimeLine[];
  duration: number;
  currentTime: number;
}

export function Timeline({
  selectedLines,
  duration,
  currentTime,
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

  return (
    <div className="flex flex-row w-full relative h-9 rounded-md bg-slate-400">
      {selectedLineElements}
      <div
        className="absolute bg-red-600 h-full w-1 top-0"
        style={{
          left: `${(currentTime / duration) * 100}%`,
        }}
      ></div>
    </div>
  );
}
