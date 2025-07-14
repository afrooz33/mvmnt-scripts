export function IsDateBusinessDaysAfter(target_date: string | Date, days: number): boolean {
  const isWeekend = (date: Date): boolean => {
    const dayOfWeek = date.getDay()

    return dayOfWeek === 0 || dayOfWeek === 6
  }

  const today = new Date()

  let businessDaysCount = 0
  const currentDate = today

  while (businessDaysCount < days) {
    currentDate.setDate(currentDate.getDate() + 1)

    if (!isWeekend(currentDate)) {
      businessDaysCount++
    }
  }

  return new Date(target_date).getTime() >= currentDate.getTime()
}
