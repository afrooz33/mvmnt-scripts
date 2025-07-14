import { DateTime } from 'luxon'

const GetDateFilterRange = (startDate, endDate): { start: any; end: any } => {
  const today = new Date()
  const sixMonthsAgo = new Date()

  sixMonthsAgo.setMonth(today.getMonth() - 6)

  if (startDate && !endDate) {
    endDate = formatDate(today)
  } else if (endDate && !startDate) {
    startDate = formatDate(sixMonthsAgo)
  } else if (!startDate && !endDate) {
    startDate = formatDate(sixMonthsAgo)
    endDate = formatDate(today)
  }

  return {
    start: startDate,
    end: endDate,
  }
}

const formatDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return year + '-' + month + '-' + day
}

function GetDaysDifference(startDate, endDate) {
  const start = new Date(startDate).getTime()
  const end = new Date(endDate).getTime()

  const timeDifference = Math.abs(end - start)
  const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24))

  return daysDifference
}

/**
 * Calculates the available delivery dates based on the provided settings and order date.
 *
 * @param {Object} settings - The settings object containing delivery_days_range, non_working_days, holidays, and order_cut_off_time.
 * @param {Date} [orderDate=new Date()] - The order date to calculate the available delivery dates from. Defaults to the current date.
 * @return {string[]} An array of available delivery dates in the format 'YYYY-MM-DD'.
 */
function GetAvailableDeliveryDates(
  settings: any,
  orderDate: Date = new Date(),
  userTimeZone: string = 'UTC',
): string[] {
  const { delivery_days_range, non_working_days, holidays, order_cut_off_time } = settings

  // Helper Functions
  const isWorkingDay = (date: DateTime): boolean => {
    const dayOfWeek = date.toFormat('cccc') // Full day name

    const isoDate = date.toISODate()

    return !non_working_days.includes(dayOfWeek) && !holidays.includes(isoDate)
  }

  const isAfterCutOff = (date: DateTime, orderCutOffTime: string): boolean => {
    const [hours, minutes] = orderCutOffTime.split(':').map(Number)
    const cutOff = date.set({ hour: hours, minute: minutes, second: 0 })
    return date >= cutOff
  }

  // Main Logic
  const availableDates: string[] = []
  let currentDate = DateTime.fromJSDate(orderDate).setZone(userTimeZone)

  // Adjust to next day if after cut-off time
  if (isAfterCutOff(currentDate, order_cut_off_time)) {
    currentDate = currentDate.plus({ days: 1 })
  }

  // Skip to the earliest working day
  let earliestCounter = delivery_days_range.earliest
  while (earliestCounter > 0) {
    if (isWorkingDay(currentDate)) {
      earliestCounter--
    }
    currentDate = currentDate.plus({ days: 1 })
  }

  // Adjust back to the last valid working day (loop overshoots)
  currentDate = currentDate.minus({ days: 1 })

  // Collect available delivery dates
  while (availableDates.length < delivery_days_range.latest - delivery_days_range.earliest + 1) {
    if (isWorkingDay(currentDate)) {
      availableDates.push(currentDate.toISODate()) // Localized ISO date
    }
    currentDate = currentDate.plus({ days: 1 })
  }

  return availableDates
}

export { GetDateFilterRange, formatDate, GetDaysDifference, GetAvailableDeliveryDates }
