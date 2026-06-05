export interface DateISOFormatObject {
  year: number
  month: number
  day: number
  hour: number
  min: number
  sec: number
  msec?: number
}

/**
 * Converts a date/time ISO string to an object with each date and time values separated.
 * - - - -
 * @param {string} dateISOString A date/time ISO string.
 * @returns {DateISOFormatObject}
 */
export const dateISOFormatToObject = (dateISOString: string): DateISOFormatObject => {
  const year = Number(dateISOString.slice(0, 4))
  const month = Number(dateISOString.slice(5, 7))
  const day = Number(dateISOString.slice(8, 10))

  const hour = Number(dateISOString.slice(11, 13))
  const min = Number(dateISOString.slice(14, 16))
  const sec = Number(dateISOString.slice(17, 19))
  const msec = Number(dateISOString.slice(20, 23))

  return { year, month, day, hour, min, sec, msec }
}

export const dateISOFormatObjectToDate = (dateObj: DateISOFormatObject): Date => {
  const { day, hour, min, month, msec, sec, year } = dateObj
  return new Date(`${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}.${msec?.toString().padStart(3, '0') ?? '000'}Z`)
}
export const dateISOFormatObjectToDateISOString = (dateObj: DateISOFormatObject): string => {
  const { day, hour, min, month, msec, sec, year } = dateObj
  return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}.${msec?.toString().padStart(3, '0') ?? '000'}Z`
}
