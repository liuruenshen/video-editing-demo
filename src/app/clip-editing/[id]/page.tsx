import { ClipsEditing as ClipsEditingServer } from "@/app/ui/server/clipsEditing";
import { Suspense } from "react";
import { LiaSpinnerSolid } from "react-icons/lia";

interface ClipEditingPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ clipList?: string }>;
}

function ClipsEditingServerSkeleton() {
  return (
    <div className="w-100 h-full p-4 text-white">
      <div className="w-full h-full rounded-md bg-gray-400 flex items-center justify-center">
        <LiaSpinnerSolid size={100} className="animate-spin" />
      </div>
    </div>
  );
}

export default async function ClipEditingPage({
  params,
  searchParams,
}: ClipEditingPageProps) {
  const [myParam, mySearchParam] = await Promise.all([params, searchParams]);

  const { clipList: clipListId } = mySearchParam;
  const { id: clipId } = myParam;

  return (
    <div className="grid grid-rows-[min-content_minmax(0,1fr)] items-center justify-center lg:grid-cols-[45%_55%] lg:grid-rows-1 text-xl bg-gray-300 h-full">
      <div className="w-full h-full order-2 lg:order-1">
        <Suspense fallback={<ClipsEditingServerSkeleton />}>
          <ClipsEditingServer clipId={clipId} clipListId={clipListId} />
        </Suspense>
      </div>
      <div
        className="w-full h-full order-1 lg:order-2 flex items-center justify-center"
        id="clips-preview"
      ></div>
    </div>
  );
}
