import { getClipSize } from "@/app/lib/clips";
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

  const size = await getClipSize(clipId);

  const content = JSON.stringify({ size: size ?? 0 });
  const res = new Response(content, {
    headers: {
      "Content-Type": "application/json",
      "Content-Length": content.length.toString(),
    },
  });

  return res;
}
