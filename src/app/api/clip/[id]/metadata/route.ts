import { getClipMetadata } from "@/app/lib/clips";
import { NextRequest } from "next/server";

type Params = Promise<{ id: string }>;

export async function GET(
  _request: NextRequest,
  { params }: { params: Params }
) {
  const { id: clipId } = await params;

  if (!clipId) {
    return new Response("Clip ID is required", { status: 400 });
  }

  const metadata = await getClipMetadata(clipId);
  if (!metadata) {
    return new Response("Clip not found", { status: 404 });
  }

  const content = JSON.stringify(metadata);
  const res = new Response(content, {
    headers: {
      "Content-Type": "application/json",
      "Content-Length": content.length.toString(),
    },
  });

  return res;
}
