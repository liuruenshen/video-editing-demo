import { getClipList, isValidClipListId } from "@/app/lib/clips";
import { getCachedClipList } from "@/app/lib/getCachedClipList";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

interface ClipListPageProps {
  params: Promise<{ id: string }>;
}

export default async function ClipListPage({ params }: ClipListPageProps) {
  const header = await headers();
  const currentUrl = header.get("x-current-url");

  const { id: clipListId } = await params;
  if (!(await isValidClipListId(clipListId))) {
    throw new Error("Invalid clip list ID");
  }

  let clipList: string[] = [];
  if (currentUrl) {
    clipList = await getCachedClipList(clipListId, currentUrl);
  } else {
    clipList = await getClipList(clipListId);
  }

  if (clipList.length === 0) {
    throw new Error("Clip list not found");
  }

  redirect(`/clip-editing/${clipList[0]}?clipList=${clipListId}`); // Redirect to the first clip in the list
}
