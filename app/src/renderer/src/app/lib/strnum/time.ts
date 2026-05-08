/**
 * Converts milliseconds to a formatted time string in M:SS format.
 *
 * Examples:
 * - 65000 -> "1:05"
 * - 125000 -> "2:05"
 * - 5000 -> "0:05"
 *
 * @param milliseconds - Time value in milliseconds.
 * @returns Formatted time string in M:SS format.
 */
export function formatMillisecondsToTimeDuration(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000)

  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
