/**
 * The cost of advanced operations of the Vercel Blob is really high, so we
 * use next.js's data cache to save the result of the API call.
 *
 * https://nextjs.org/docs/app/deep-dive/caching#data-cache
 */
export async function getCachedClipList(
  clipListId: string,
  url: string
): Promise<string[]> {
  const apiUrl = new URL(`/api/clip-list/${clipListId}`, url).toString();

  const response = await fetch(apiUrl, {
    next: { revalidate: 86400 },
    cache: "force-cache",
  });

  return await response.json();
}
