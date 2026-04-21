/**
 * Validates whether a string is a safe folder name across Windows, macOS, and Linux.
 *
 * Rules enforced:
 * - Must not be empty or only whitespace
 * - Must not contain invalid characters: < > : " / \ | ? *
 * - Must not contain control characters (ASCII 0–31)
 * - Must not end with a space or dot (Windows restriction)
 * - Must not be a reserved Windows name (e.g., CON, PRN, AUX, NUL, COM1–COM9, LPT1–LPT9)
 * - - - -
 * @param {string} name The folder name to validate.
 * @returns Return `true` if valid, `false` otherwise.
 */
export function isValidFolderName(name: string): true | 'noEmptyString' | 'noInvalidChars' | 'noEndsWithSpaceOrDot' | 'noSystemReservedNames' {
  if (!name || name.trim().length === 0) {
    return 'noEmptyString'
  }

  // Invalid characters (Windows + safe cross-platform)
  const invalidChars = /[<>:"/\\|?*\x00-\x1F]/
  if (invalidChars.test(name)) {
    return 'noInvalidChars'
  }

  // Cannot end with space or dot (Windows)
  if (/[. ]$/.test(name)) {
    return 'noEndsWithSpaceOrDot'
  }

  // Reserved Windows names (case-insensitive)
  const reservedNames = new Set(['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'])

  if (reservedNames.has(name.toUpperCase())) {
    return 'noSystemReservedNames'
  }

  return true
}
