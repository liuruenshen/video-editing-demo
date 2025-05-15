import { getClipList, getClipMetadata, isValidVideoId } from "@/app/lib/clips";
import { ClipsEditing as ClipEditingClient } from "../client/clipsEditing";
import { ClipMetaData, MOCK_CLIP_ID } from "@/app/client-server/const";
import { headers } from "next/headers";
import { getCachedClipMetadata } from "@/app/lib/getCachedClipMetadata";
import { getCachedClipList } from "@/app/lib/getCachedClipList";

interface ClipEditingProps {
  clipId: string;
  clipListId?: string;
}

export async function ClipsEditing({ clipId, clipListId }: ClipEditingProps) {
  const header = await headers();
  const currentUrl = header.get("x-current-url");

  if (!(await isValidVideoId(clipId))) {
    throw new Error("Invalid clip ID");
  }

  let clipListIds: string[] = [];
  if (clipListId) {
    if (currentUrl) {
      clipListIds = await getCachedClipList(clipListId, currentUrl);
    } else {
      clipListIds = await getClipList(clipListId);
    }
  } else if (!MOCK_CLIP_ID.includes(clipId)) {
    clipId = MOCK_CLIP_ID[0];
  }

  let clipMetadata: ClipMetaData | null = null;
  if (currentUrl) {
    clipMetadata = await getCachedClipMetadata(clipId, currentUrl);
  } else {
    clipMetadata = await getClipMetadata(clipId);
  }

  if (!clipMetadata) {
    throw new Error("Clip not found");
  }

  return (
    <ClipEditingClient
      clipMetadata={clipMetadata}
      language="en"
      clipId={clipId}
      clipListIds={clipListIds}
    />
  );
}
