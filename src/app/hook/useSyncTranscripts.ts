import { ClipMetaData } from "../client-server/const";
import { useCallback, useEffect, useRef } from "react";
import { timestampToSeconds } from "../client-server/utils";

interface UseSyncTranscriptsProps {
  clipMetadata: ClipMetaData;
  language: string;
}

interface TranscriptInfo {
  start: number;
  end: number;
  element: HTMLElement | null;
}

export function getTranscriptTrackId(startTime: string) {
  return `transcript-track-${timestampToSeconds(startTime)}`;
}

function getScrollInViewStartTime(
  lastTrackIndex: number,
  currentTime: number,
  tracks: TranscriptInfo[]
) {
  let newLastTrackIndex = lastTrackIndex;

  if (currentTime < tracks[lastTrackIndex].start) {
    let index = lastTrackIndex - 1;
    while (index > -1) {
      if (currentTime < tracks[index].start) {
        newLastTrackIndex = index--;
      } else if (
        currentTime >= tracks[index].start &&
        currentTime <= tracks[index].end
      ) {
        newLastTrackIndex = index;
        break;
      } else {
        break;
      }
    }
  } else if (currentTime > tracks[lastTrackIndex].end) {
    let index = lastTrackIndex + 1;
    while (index < tracks.length) {
      if (
        (currentTime >= tracks[index].start &&
          currentTime <= tracks[index].end) ||
        currentTime < tracks[index].start
      ) {
        newLastTrackIndex = index;
        break;
      }

      index++;
    }
  }

  return newLastTrackIndex;
}

export function useSyncTranscripts({
  clipMetadata,
  language,
}: UseSyncTranscriptsProps) {
  const transcriptsInfo = useRef<TranscriptInfo[]>([]);
  const scrollToIndexRef = useRef<number>(0);
  const currentLineRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    transcriptsInfo.current = clipMetadata.transcriptSections
      .map((section) => {
        if (section.subtitleInfo.srclang !== language) return [];
        return section.tracks.map((track) => {
          const element = document.getElementById(
            getTranscriptTrackId(track.startTime)
          );

          return {
            start: timestampToSeconds(track.startTime),
            end: timestampToSeconds(track.endTime),
            element,
          };
        });
      })
      .flat();
  }, [clipMetadata, language]);

  const onTimeUpdate = useCallback(
    (currentTime: number) => {
      scrollToIndexRef.current = getScrollInViewStartTime(
        scrollToIndexRef.current,
        currentTime,
        transcriptsInfo.current
      );

      const element = transcriptsInfo.current[scrollToIndexRef.current].element;
      if (element) {
        if (currentLineRef.current) {
          currentLineRef.current.removeAttribute("data-current-line");
        }

        currentLineRef.current = element;
        element.scrollIntoView();
        element.setAttribute("data-current-line", "true");
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [clipMetadata, language]
  );

  return { onTimeUpdate };
}
