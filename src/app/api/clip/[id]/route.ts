import { getClipStream, getClipMetadata, getClipStat } from "@/app/lib/clips";
import { getHttpRange } from "@/app/lib/httpRange";
import { NextRequest } from "next/server";
import { Readable } from "node:stream";

type Params = Promise<{ id: string }>;

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  const { id: clipId } = await params;
  const range = request.headers.get("range");

  if (!range) {
    return new Response("Range header is required", { status: 416 });
  }

  if (!clipId) {
    return new Response("Clip ID is required", { status: 400 });
  }

  const metadata = await getClipMetadata(clipId);
  if (!metadata) {
    return new Response("Clip not found", { status: 404 });
  }

  const clipStat = getClipStat(clipId);
  if (!clipStat) {
    return new Response("Clip stat not found", { status: 404 });
  }

  const { start, end } = getHttpRange(range, clipStat.size);

  const clipStream = getClipStream(clipId, { start, end });
  if (!clipStream) {
    return new Response("Clip stream not found", { status: 404 });
  }

  /**
   * https://exploringjs.com/nodejs-shell-scripting/ch_web-streams.html#example-reading-a-file-via-a-readablestream
   */
  const clipReadableStream = Readable.toWeb(clipStream);

  const res = new Response(
    // @ts-expect-error fix later
    clipReadableStream,
    // https://www.youtube.com/watch?v=Jl2OmUqDpEQ
    {
      headers: {
        "Content-Range": `bytes ${start}-${end}/${clipStat.size}`,
        "Accept-Ranges": "bytes",
        "Content-Length": clipStat.size,
        "Content-Type": metadata.mimeType,
      },
      status: 206,
    }
  );

  return res;
}
