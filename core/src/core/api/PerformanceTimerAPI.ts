import { formatDuration } from '../../lib.exports'

/**
 * A class that calculates performance time between one point of the script to the other.
 */
export class PerformanceTimerAPI {
  /**
   * The starting time of the operation, this is assigned on the class' constructor.
   */
  startTime: number
  /**
   * The end time of the operation, this is assigned when calling the `.end()` method.
   */
  endTime: number | undefined

  constructor() {
    this.startTime = performance.now()
  }

  /**
   * Assigns a number value to `this.endTime` and returns a formatted string of the operation.
   * - - - -
   * @returns {string}
   */
  end(): string {
    this.endTime = performance.now()
    return formatDuration(this.endTime - this.startTime)
  }
}
