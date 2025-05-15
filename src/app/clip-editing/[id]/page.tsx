import { ClipsEditing as ClipsEditingServer } from "@/app/ui/server/clipsEditing";
import { Suspense } from "react";

interface ClipEditingPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ clipList?: string }>;
}

function ClipsEditingServerSkeleton() {
  const skeletonItems = Array.from({ length: 10 }, (_, index) => (
    <div
      className="w-full h-10 bg-gray-400 rounded-lg animate-pulse"
      key={index}
    ></div>
  ));
  return (
    <div className="w-full h-full p-4 text-white flex items-center justify-start flex-col gap-4">
      {skeletonItems}
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
    <div className="w-full grid grid-cols-1 grid-rows-[min-content_minmax(0,1fr)] items-center justify-center lg:grid-cols-[45%_55%] lg:grid-rows-1 text-xl bg-gray-300 h-full">
      <div className="w-full h-full order-2 lg:order-1">
        <Suspense fallback={<ClipsEditingServerSkeleton />}>
          <ClipsEditingServer clipId={clipId} clipListId={clipListId} />
        </Suspense>
      </div>
      <div
        className="w-full h-full order-1 lg:order-2 flex items-center justify-center"
        id="clips-preview"
      >
        <div className="w-full h-full p-4 [&[data-hidden]]:hidden">
          <div className="w-full h-80 bg-gray-400 rounded-lg animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
