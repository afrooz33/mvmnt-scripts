import { DateTime } from 'luxon'

export class DeliveryDateHelper {
  /**
   * Calculates the estimated delivery date based on the number of delivery days provided.
   *
   * @param estimatedDeliveryDays Number of estimated delivery days.
   * @param includeWeekends Whether to include weekends in the calculation.
   * @returns Calculated estimated delivery date.
   */
  static calculateEstimatedDeliveryDate(
    estimatedDeliveryDays: number,
    includeWeekends: boolean = false,
  ): DateTime {
    const currentDate = DateTime.now()

    if (!estimatedDeliveryDays || estimatedDeliveryDays <= 0) {
      // If no delivery days are provided or the value is invalid, return a default estimate (e.g., 7 days).
      return DeliveryDateHelper.defaultDeliveryDate(currentDate)
    }

    let estimatedDeliveryDate: DateTime

    if (includeWeekends) {
      // Case 1: Include weekends in the calculation
      estimatedDeliveryDate = currentDate.plus({ days: estimatedDeliveryDays })
    } else {
      // Case 2: Exclude weekends (business days only)
      estimatedDeliveryDate = DeliveryDateHelper.addBusinessDays(currentDate, estimatedDeliveryDays)
    }

    // Additional logic for holidays or specific rules can be added here

    return estimatedDeliveryDate
  }

  /**
   * Returns a default delivery date when no estimated days are provided.
   *
   * @param currentDate The current date.
   * @returns Default delivery date (e.g., 7 days from now).
   */
  private static defaultDeliveryDate(currentDate: DateTime): DateTime {
    const defaultDeliveryDays = 7
    const estimatedDeliveryDate = DeliveryDateHelper.addBusinessDays(
      currentDate,
      defaultDeliveryDays,
    )

    // Ensure the default delivery date is on a weekday
    return estimatedDeliveryDate.weekday > 5
      ? DeliveryDateHelper.nextBusinessDay(estimatedDeliveryDate)
      : estimatedDeliveryDate
  }

  /**
   * Adds business days to the current date, skipping weekends.
   *
   * @param date The date to start from.
   * @param businessDays The number of business days to add.
   * @returns The date after adding the business days.
   */
  private static addBusinessDays(date: DateTime, businessDays: number): DateTime {
    let daysAdded = 0
    let currentDate = date

    while (daysAdded < businessDays) {
      currentDate = currentDate.plus({ days: 1 })
      // Check if it's a weekday (Monday to Friday)
      if (currentDate.weekday <= 5) {
        daysAdded++
      }
    }

    return currentDate
  }

  /**
   * Returns the next business day if the given date falls on a weekend.
   *
   * @param date The date to check.
   * @returns The next business day.
   */
  private static nextBusinessDay(date: DateTime): DateTime {
    let nextDay = date
    while (nextDay.weekday > 5) {
      // 6 = Saturday, 7 = Sunday
      nextDay = nextDay.plus({ days: 1 })
    }
    return nextDay
  }
}
