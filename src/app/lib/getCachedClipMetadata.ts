import { ClipMetaData } from "../client-server/const";

/**
 * The cost of advanced operations of the Vercel Blob is really high, so we
 * use next.js's data cache to save the result of the API call.
 *
 * https://nextjs.org/docs/app/deep-dive/caching#data-cache
 */
export async function getCachedClipMetadata(
  clipId: string,
  url: string
): Promise<ClipMetaData> {
  const metadataApiUrl = new URL(
    `/api/clip/${clipId}/metadata`,
    url
  ).toString();
  const response = await fetch(metadataApiUrl, {
    next: { revalidate: 86400 },
    cache: "force-cache",
  });

  return await response.json();
}
