export function getDisplayedTime(time: string) {
  return time.replace(/,.+/, "");
}

export function timestampToSeconds(timestamp: string) {
  const [time, decimalPart] = timestamp.split(",");
  const [hours, minutes, seconds] = time.split(":").map(Number);
  return hours * 3600 + minutes * 60 + seconds + Number(decimalPart) / 1000;
}

export function secondsToTimestamp(seconds: number) {
  const hours = Math.floor(Math.ceil(seconds) / 3600);
  let remainingSeconds = seconds % 3600;
  const minutes = Math.floor(remainingSeconds / 60);
  remainingSeconds = Math.floor(remainingSeconds % 60);

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(remainingSeconds).padStart(2, "0")}`;
}
