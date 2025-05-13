"use client";

import { createPortal } from "react-dom";
import { ClipMetaData, MOCK_CLIP_ID } from "../../client-server/const";
import { TranscriptSection } from "./transcriptSection";
import { ClipsPreview, ClipsReviewPublicApi } from "./clipsPreview";
import { useEffect, useRef, useState } from "react";

interface ClipsEditingProps {
  clipMetadata: ClipMetaData;
}

export function ClipsEditing({ clipMetadata }: ClipsEditingProps) {
  const previewApiRef = useRef<ClipsReviewPublicApi>(null);
  const subtitleLanguage = clipMetadata.subtitle.languages[0];
  const [previewNode, setPreviewNode] = useState<HTMLDivElement | null>(null);

  const transcripts = clipMetadata.transcriptSections.map((item) => {
    return <TranscriptSection transcriptSections={item} key={item.title} />;
  });

  useEffect(() => {
    const root: HTMLDivElement | null = document.getElementById(
      "clips-preview"
    ) as HTMLDivElement;
    if (root) {
      setPreviewNode(root);
    }

    return () => {
      setPreviewNode(null);
    };
  }, []);

  return (
    <>
      <div className="grid grid-rows-[min-content_minmax(0,1fr)] items-start justify-stretch gap-2 p-2 h-full overflow-hidden">
        <h1 className="text-2xl font-bold">{clipMetadata.description}</h1>
        <div className="overflow-scroll min-h-0 max-h-full flex flex-col gap-3">
          {transcripts}
        </div>
      </div>
      {previewNode
        ? createPortal(
            <ClipsPreview
              clipId={MOCK_CLIP_ID}
              subtitleLanguage={subtitleLanguage}
              ref={previewApiRef}
            />,
            previewNode
          )
        : null}
    </>
  );
}
