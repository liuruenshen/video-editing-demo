"use client";

import { createPortal } from "react-dom";
import { ClipMetaData, MOCK_CLIP_ID } from "../../client-server/const";
import { SubtitleTrack, TranscriptSection } from "./transcriptSection";
import { ClipsPreview, ClipsReviewPublicApi } from "./clipsPreview";
import { useEffect, useMemo, useRef, useState } from "react";
import { timestampToSeconds } from "@/app/client-server/utils";

interface ClipsEditingProps {
  clipMetadata: ClipMetaData;
}

export function ClipsEditing({ clipMetadata }: ClipsEditingProps) {
  /**
   * we use useImperativeHandle to expose the play, pause and seek methods
   */
  const previewApiRef = useRef<ClipsReviewPublicApi>(null);
  const subtitleLanguage = clipMetadata.subtitle.languages[0];

  /**
   * we use `createPortal` to mount the ClipsPreview component to the parent's sibling node.
   * By using this approach, we can implement the Streaming mechanism for smooth ui transition.
   */
  const [previewNode, setPreviewNode] = useState<HTMLDivElement | null>(null);

  const [selectedLines, setSelectedLines] = useState<string[]>(() => {
    let result: string[] = [];
    clipMetadata.transcriptSections.forEach((item) => {
      result = result.concat(
        item.tracks
          .filter((track) => track.highlight)
          .map((track) => track.startTime)
      );
    });

    return result;
  });

  const selectedLineSet = useMemo(() => {
    return new Set<string>(selectedLines);
  }, [selectedLines]);

  function onSelectLine(track: SubtitleTrack) {
    if (selectedLines.includes(track.startTime)) {
      setSelectedLines((prev) =>
        prev.filter((item) => item !== track.startTime)
      );
    } else {
      setSelectedLines((prev) => [...prev, track.startTime]);
    }
    onSelectTimestamp(track.startTime);
  }

  function onSelectTimestamp(timestamp: string) {
    if (!previewApiRef.current) return;
    previewApiRef.current.seek(timestampToSeconds(timestamp));
  }

  const transcripts = clipMetadata.transcriptSections.map((item) => {
    return (
      <TranscriptSection
        transcriptSections={item}
        key={item.title}
        onClick={onSelectLine}
        onTimestampClick={onSelectTimestamp}
        selectedLines={selectedLineSet}
      />
    );
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
