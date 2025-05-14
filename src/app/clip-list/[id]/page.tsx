import { getClipList, isValidClipListId } from "@/app/lib/clips";
import { redirect } from "next/navigation";

interface ClipListPageProps {
  params: Promise<{ id: string }>;
}

export default async function ClipListPage({ params }: ClipListPageProps) {
  const { id: clipListId } = await params;
  if (!isValidClipListId(clipListId)) {
    throw new Error("Invalid clip list ID");
  }

  const data: string[] = await getClipList(clipListId);
  if (data.length === 0) {
    throw new Error("Clip list not found");
  }

  redirect(`/clip-editing/${data[0]}?clipList=${clipListId}`); // Redirect to the first clip in the list
}
