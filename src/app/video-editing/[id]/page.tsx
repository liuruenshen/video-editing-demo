import { getClipMetadata, isValidVideoId } from "@/app/lib/clips";
import { ClipMetaData, MOCK_CLIP_ID } from "@/app/client-server/const";
import { ClipsEditing } from "@/app/ui/client/clipsEditing";

interface VideoEditingPageProps {
  params: Promise<{ id: string }>;
}

export default async function VideoEditingPage({
  params,
}: VideoEditingPageProps) {
  const { id: clipId } = await params;
  if (!isValidVideoId(clipId)) {
    throw new Error("Invalid clip ID");
  }

  let mockClipId = MOCK_CLIP_ID[0];
  if (MOCK_CLIP_ID.includes(clipId)) {
    mockClipId = clipId;
  }

  const data: ClipMetaData | null = await getClipMetadata(mockClipId);
  if (!data) {
    throw new Error("Clip not found");
  }

  return (
    <div className="grid grid-rows-[min-content_minmax(0,1fr)] items-center justify-center lg:grid-cols-[45%_55%] lg:grid-rows-1 text-xl bg-gray-300 h-full">
      <div className="w-full h-full order-2 lg:order-1">
        <ClipsEditing clipMetadata={data} language="en" clipId={mockClipId} />
      </div>
      <div
        className="w-full h-full order-1 lg:order-2 flex items-center justify-center"
        id="clips-preview"
      ></div>
    </div>
  );
}
