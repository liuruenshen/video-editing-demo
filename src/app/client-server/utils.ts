export function getDisplayedTime(time: string) {
  return time.replace(/,.+/, "");
}

export function timestampToSeconds(timestamp: string) {
  const [time, decimalPart] = timestamp.split(",");
  const [hours, minutes, seconds] = time.split(":").map(Number);
  return hours * 3600 + minutes * 60 + seconds + Number(decimalPart) / 1000;
}
