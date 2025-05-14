/**
 * Ignore the multiple ranges
 */
const REGEXP = /.+=(\d*)-(\d*)/;
export function getHttpRange(range: string, size: number, chunk: number) {
  const match = range.match(REGEXP);
  if (!match) {
    return { start: 0, end: Math.min(size - 1, chunk - 1) };
  }

  const [, rangeStart, rangeEnd] = match;
  if (!rangeStart && !rangeEnd) {
    return { start: 0, end: Math.min(size - 1, chunk - 1) };
  }

  let start = 0;
  let end = 0;
  if (!rangeStart) {
    start = size - Number(rangeEnd);
    end = size - 1;
  } else if (!rangeEnd) {
    start = Number(rangeStart);
    end = Math.min(size - 1, start + chunk - 1);
  } else {
    start = Number(rangeStart);
    end = Number(rangeEnd);
  }

  return { start, end };
}
