import { getCachedClipList } from "@/app/lib/getCachedClipList";
import { NextRequest } from "next/server";

type Params = Promise<{ id: string }>;

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  const { id: clipListId } = await params;

  if (!clipListId) {
    return new Response("Clip List ID is required", { status: 400 });
  }

  const clipList: string[] = await getCachedClipList(clipListId, request.url);

  const content = JSON.stringify(clipList);
  const res = new Response(content, {
    headers: {
      "Content-Type": "application/json",
      "Content-Length": content.length.toString(),
    },
  });

  return res;
}
