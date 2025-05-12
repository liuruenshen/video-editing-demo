import {
  ClipMetaData,
  getClipMetadata,
  isValidVideoId,
  MOCK_CLIP_ID,
} from "@/app/lib/clips";
import { ClipsEditing } from "@/app/ui/client/clipsEditing";
import { ClipsPreview } from "@/app/ui/client/clipsPreview";

interface VideoEditingPageProps {
  params: Promise<{ id: string }>;
}

export default async function VideoEditingPage({
  params,
}: VideoEditingPageProps) {
  const { id: videoId } = await params;
  if (!isValidVideoId(videoId)) {
    throw new Error("Invalid video ID");
  }
  const data: ClipMetaData | null = await getClipMetadata(MOCK_CLIP_ID);
  if (!data) {
    throw new Error("Clip not found");
  }

  return (
    <div className="grid grid-rows-[min-content_minmax(0,1fr)] items-center justify-center lg:grid-cols-2 lg:grid-rows-1 text-xl bg-gray-300 h-full">
      <div className="w-full h-full order-2 lg:order-1">
        <ClipsEditing clipMetadata={data} />
      </div>
      <div className="w-full h-full order-1 lg:order-2 flex items-center justify-center">
        <ClipsPreview clipId={MOCK_CLIP_ID} />
      </div>
    </div>
  );
}
