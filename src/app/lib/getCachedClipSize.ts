/**
 * The cost of advanced operations of the Vercel Blob is really high, so we
 * use next.js's data cache to save the result of the API call.
 *
 * https://nextjs.org/docs/app/deep-dive/caching#data-cache
 */
export async function getCachedClipSize(
  clipId: string,
  url: string
): Promise<number> {
  const sizeApiUrl = new URL(`/api/clip/${clipId}/size`, url).toString();
  const response = await fetch(sizeApiUrl, {
    next: { revalidate: 86400 },
    cache: "force-cache",
  });

  const body = await response.json();

  return body.size ?? 0;
}
