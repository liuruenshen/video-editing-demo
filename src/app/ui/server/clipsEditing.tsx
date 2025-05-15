import { getClipList, getClipMetadata, isValidVideoId } from "@/app/lib/clips";
import { ClipsEditing as ClipEditingClient } from "../client/clipsEditing";
import { MOCK_CLIP_ID } from "@/app/client-server/const";

interface ClipEditingProps {
  clipId: string;
  clipListId?: string;
}

export async function ClipsEditing({ clipId, clipListId }: ClipEditingProps) {
  if (!(await isValidVideoId(clipId))) {
    throw new Error("Invalid clip ID");
  }

  let clipListIds: string[] = [];
  if (clipListId) {
    clipListIds = await getClipList(clipListId);
    if (!clipListIds.includes(clipId)) {
      clipId = clipListIds[0];
    }
  } else if (!MOCK_CLIP_ID.includes(clipId)) {
    clipId = MOCK_CLIP_ID[0];
  }

  const clipMetadata = await getClipMetadata(clipId);

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
