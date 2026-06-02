/**
 * Converts milliseconds to a formatted time string in [HH:]M:SS format. Hours will also appear on the returned string if the length is enough for an hour.
 *
 * Examples:
 * - 65000 -> "1:05"
 * - 125000 -> "2:05"
 * - 5000 -> "0:05"
 * - 3600000 -> 1:00:00
 * - 3661000 -> 1:01:01
 *
 * @param milliseconds - Time value in milliseconds.
 * @returns Formatted time string in [HH:]M:SS format.
 */
export function formatMillisecondsToTimeDuration(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000)

  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
