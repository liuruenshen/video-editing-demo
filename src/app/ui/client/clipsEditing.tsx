'use client";';

import { ClipMetaData } from "../../lib/clips";
import { TranscriptSection } from "./transcriptSection";

interface ClipsEditingProps {
  clipMetadata: ClipMetaData;
}

export async function ClipsEditing({ clipMetadata }: ClipsEditingProps) {
  const transcripts = clipMetadata.transcriptSections.map((item) => {
    return <TranscriptSection transcriptSections={item} key={item.title} />;
  });

  return (
    <div className="grid grid-rows-[min-content_minmax(0,1fr)] items-start justify-stretch gap-2 p-2 h-full overflow-hidden">
      <h1 className="text-2xl font-bold">{clipMetadata.description}</h1>
      <div className="overflow-scroll min-h-0 max-h-full flex flex-col gap-3">
        {transcripts}
      </div>
    </div>
  );
}
