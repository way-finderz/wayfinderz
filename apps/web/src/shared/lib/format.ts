/**
 * Format milliseconds as a time string (M:SS format)
 * @param ms - Time in milliseconds
 * @returns Formatted time string like "1:30" or "12:05"
 */
export function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
