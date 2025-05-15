"use client";

import { createPortal } from "react-dom";
import { ClipMetaData } from "../../client-server/const";
import { SubtitleTrack, TranscriptSection } from "./transcriptSection";
import { ClipsPreview, ClipsReviewPublicApi } from "./clipsPreview";
import { useEffect, useMemo, useRef, useState } from "react";
import { timestampToSeconds } from "@/app/client-server/utils";
import { useSyncTranscripts } from "@/app/hook/useSyncTranscripts";
import { SelectedTimeLine } from "./timeline";

interface ClipsEditingProps {
  clipMetadata: ClipMetaData;
  language: string;
  clipId: string;
  clipListIds: string[];
}

export function ClipsEditing({
  clipMetadata,
  language,
  clipId,
  clipListIds,
}: ClipsEditingProps) {
  /**
   * we use useImperativeHandle to expose the play, pause and seek methods
   */
  const previewApiRef = useRef<ClipsReviewPublicApi>(null);
  const subtitleLanguage = clipMetadata.subtitle.languages[0];

  const { onTimeUpdate } = useSyncTranscripts({ clipMetadata, language });
  /**
   * we use `createPortal` to mount the ClipsPreview component to the parent's sibling node.
   * By using this approach, we can share states between these two components without
   * being restricted by the parent component's DOM hierarchy.
   */
  const [previewNode, setPreviewNode] = useState<HTMLDivElement | null>(null);

  /**
   * Extract subtitle tracks from the clip metadata's transcription sections based on the selected language.
   */
  const subtitleTracks = useMemo(() => {
    let tracks: SubtitleTrack[] = [];
    clipMetadata.transcriptSections.forEach((item) => {
      if (item.subtitleInfo.srclang !== language) return;
      tracks = tracks.concat(item.tracks);
    });
    return tracks;
  }, [clipMetadata, language]);

  /**
   * Create a map of subtitle tracks for quick access by start time.
   */
  const subtitleTrackMap = useMemo(() => {
    const result: Record<string, SubtitleTrack> = {};
    subtitleTracks.forEach((track) => {
      result[track.startTime] = track;
    });

    return result;
  }, [subtitleTracks]);

  /**
   * Store user-selected/highlight lines in the subtitle tracks.
   */
  const [selectedLines, setSelectedLines] = useState<string[]>(() => {
    return subtitleTracks
      .filter((track) => track.highlight)
      .map((track) => track.startTime);
  });

  /**
   * Create a list of selected lines based on the `selectedLines` to
   * display marks on the playback timeline(presented in `timeline` component).
   */
  const selectedTimeLine = useMemo(() => {
    const result: SelectedTimeLine[] = selectedLines.map((start) => ({
      start: timestampToSeconds(subtitleTrackMap[start].startTime),
      end: timestampToSeconds(subtitleTrackMap[start].endTime),
    }));

    return result;
  }, [selectedLines, subtitleTrackMap]);

  /**
   * A set of `selectedLines` to highlight selected lines in the `transcriptSection` component.
   */
  const selectedLineSet = useMemo(() => {
    return new Set<string>(selectedLines);
  }, [selectedLines]);

  /**
   * Update `selectedLines` to reflect the user's selection in the `transcriptSection` component.
   */
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
    /**
     * Set the second arguments to `true` to prevent the UI synchronization
     * of scrolling `transcriptSection` component.
     */
    previewApiRef.current.seek(timestampToSeconds(timestamp), true);
  }

  const transcripts = clipMetadata.transcriptSections
    .map((item) => {
      if (item.subtitleInfo.srclang !== language) return;
      return (
        <TranscriptSection
          transcriptSections={item}
          key={item.title}
          onClick={onSelectLine}
          onTimestampClick={onSelectTimestamp}
          selectedLines={selectedLineSet}
        />
      );
    })
    .filter(Boolean);

  useEffect(() => {
    const root: HTMLDivElement | null = document.getElementById(
      "clips-preview"
    ) as HTMLDivElement;
    if (root) {
      setPreviewNode(root);
    }

    const firstChild = root.firstChild;
    if (firstChild) {
      (firstChild as HTMLDivElement).setAttribute("data-hidden", "true");
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
              clipId={clipId}
              subtitleLanguage={subtitleLanguage}
              ref={previewApiRef}
              selectedTimeline={selectedTimeLine}
              onTimeUpdate={onTimeUpdate}
              clipListIds={clipListIds}
            />,
            previewNode
          )
        : null}
    </>
  );
}
