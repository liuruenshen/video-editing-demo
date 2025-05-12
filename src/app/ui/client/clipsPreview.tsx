'use client";';

interface ClipsPreviewProps {
  clipId: string;
}

export function ClipsPreview({ clipId }: ClipsPreviewProps) {
  return (
    <div className="bg-slate-900 flex h-full flex-col justify-start items-start text-white p-2 w-full gap-1">
      <h2 className="text-xl lg:text-2xl">Preview</h2>
      <video
        src={`/api/clip/${clipId}`}
        className="w-full min-h-[20vh] max-h-[40vh]"
        controls={true}
      ></video>
    </div>
  );
}
