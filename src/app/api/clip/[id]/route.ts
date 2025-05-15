import { getClipStream, getClipMetadata, getClipSize } from "@/app/lib/clips";
import { getHttpRange } from "@/app/lib/httpRange";
import { NextRequest } from "next/server";

type Params = Promise<{ id: string }>;

const DEFAULT_CHUNK = 1024 * 1024 * 5; // 1MB

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  const { id: clipId } = await params;
  let range = request.headers.get("range");

  if (!range) {
    range = `bytes=0-${DEFAULT_CHUNK}`;
  }

  if (!clipId) {
    return new Response("Clip ID is required", { status: 400 });
  }

  const metadata = await getClipMetadata(clipId);
  if (!metadata) {
    return new Response("Clip not found", { status: 404 });
  }

  const size = await getClipSize(clipId);
  if (!size) {
    return new Response("Clip stat not found", { status: 404 });
  }

  const { start, end } = getHttpRange(range, size, DEFAULT_CHUNK);

  const clipStream = await getClipStream(clipId, { start, end });
  if (!clipStream) {
    return new Response("Clip stream not found", { status: 404 });
  }

  const res = new Response(
    // @ts-expect-error fix later
    clipStream,
    // https://www.youtube.com/watch?v=Jl2OmUqDpEQ
    {
      headers: {
        "Content-Range": `bytes ${start}-${end}/${size}`,
        "Accept-Ranges": "bytes",
        // This is the length of the range being sent, not the total video length
        "Content-Length": end - start + 1,
        "Content-Type": metadata.mimeType,
      },
      status: 206,
    }
  );

  return res;
}
