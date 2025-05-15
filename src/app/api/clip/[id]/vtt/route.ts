import { ClipMetaData } from "@/app/client-server/const";
import { getCachedClipMetadata } from "@/app/lib/getCachedClipMetadata";
import { NextRequest } from "next/server";

type Params = Promise<{ id: string }>;

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  const { id: clipId } = await params;
  const lang = request.nextUrl.searchParams.get("lang");

  if (!clipId) {
    return new Response("Clip ID is required", { status: 400 });
  }

  const metadata: ClipMetaData = await getCachedClipMetadata(
    clipId,
    request.url
  );
  if (!metadata) {
    return new Response("Clip not found", { status: 404 });
  }

  let content = `WEBVTT\n\n`;
  metadata.transcriptSections.forEach((section) => {
    if (!lang || section.subtitleInfo.srclang === lang) {
      section.tracks.forEach((track) => {
        content += `${track.startTime.replace(
          ",",
          "."
        )} --> ${track.endTime.replace(",", ".")}\n`;
        content += `${track.text}\n\n`;
      });
    }
  });

  const res = new Response(content, {
    headers: {
      "Content-Type": "text/vtt",
      "Content-Disposition": `inline; filename="${clipId}.vtt"`,
      "Content-Length": content.length.toString(),
    },
  });

  return res;
}
