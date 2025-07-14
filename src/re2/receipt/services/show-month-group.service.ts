import { DateTime } from 'luxon'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { QueryDto } from '@app/src/re2/receipt/dto'
import { DONATION_STATUS } from '@app/src/donations/enums'

export default async function (query: QueryDto, userId: string) {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.re2UserRepository)
      .addFilter('id', userId)
      .create()

    results.condition.select(['id', 'created'])

    const user = await results.condition.getRawOne()
    const months = getRecurringDonationMonths(user.created)

    const totalRecords = months.length
    const totalPages = Math.ceil(totalRecords / Number.parseInt(query.limit))
    const currentPage = Number.parseInt(query.page)

    const paginatedMonths = paginateMonths(months, currentPage, Number.parseInt(query.limit))

    const data = await Promise.all(
      paginatedMonths.map(async (date) => {
        const [year, month] = date.split('/')
        const stats = await GetDonationStats.bind(this)(userId, year, month, query)

        return { year, month, stats }
      }),
    )

    return {
      data,
      meta: {
        current_page: currentPage,
        limit: Number.parseInt(query.limit),
        total_page: totalPages,
        total_record: totalRecords,
        next_page: currentPage < totalPages ? currentPage + 1 : null,
        prev_page: currentPage > 1 ? currentPage - 1 : null,
      },
    }
  } catch (error) {
    return HandleErrors(error)
  }
}

async function GetDonationStats(userId: string, year: string, month: string, query: QueryDto) {
  const startDate = DateTime.fromObject({
    year: Number(year),
    month: Number(month),
    day: 1,
  }).toISODate()

  const endDate = DateTime.fromObject({ year: Number(year), month: Number(month) })
    .endOf('month')
    .toISODate()

  const results = new QueryBuilder({})
    .useQuery(this.userDonationsRepository)
    .addRelation('user_donation_payment')
    .addFilter('is_recurring', true)
    .create()

  results.condition.select([
    'data.id',
    'data.status',
    'data.created',
    'user_donation_payment.reference_id',
  ])

  results.condition.andWhere(
    `"user_donation_payment"."reference_id" IN (SELECT "id" FROM re2_fundraisers WHERE "userId" = :userId)`,
    { userId },
  )

  results.condition.andWhere(
    `DATE_TRUNC('month', "data"."created") BETWEEN :start_date AND :end_date`,
    {
      start_date: startDate,
      end_date: endDate,
    },
  )

  if (query?.date_filter?.start && query?.date_filter?.end) {
    results.condition.andWhere(`"data"."created" BETWEEN :start_date AND :end_date`, {
      start_date: query.date_filter.start,
      end_date: query.date_filter.end,
    })
  } else if (query?.date_filter?.start) {
    results.condition.andWhere(`"data"."created" >= :start_date`, {
      start_date: query.date_filter.start,
    })
  } else if (query?.date_filter?.end) {
    results.condition.andWhere(`"data"."created" <= :end_date`, { end_date: query.date_filter.end })
  }

  const payments = await results.condition.getRawMany()

  return {
    pending: payments.filter((p) => p.status === DONATION_STATUS.COMPLETED).length,
    success: payments.filter((p) => p.status === DONATION_STATUS.SETTLED).length,
    failed: payments.filter(
      (p) => p.status === DONATION_STATUS.REFUNDED || p.status === DONATION_STATUS.CANCELLED,
    ).length,
  }
}

function getRecurringDonationMonths(registrationDate: string): string[] {
  const userStart = DateTime.fromJSDate(new Date(registrationDate)).setZone('utc')

  if (!userStart.isValid) {
    return []
  }

  const start = userStart.startOf('month')
  const today = DateTime.now().setZone('utc').startOf('month')

  const months: string[] = []
  let current = start

  while (current <= today) {
    months.push(current.toFormat('yyyy/MM'))
    current = current.plus({ months: 1 })
  }

  months.reverse()

  return months
}

function paginateMonths(months: string[], page: number, limit: number): string[] {
  const totalRecords = months.length
  const totalPages = Math.ceil(totalRecords / limit)

  if (page < 1) {
    page = 1
  }

  if (page > totalPages) {
    return []
  }

  const startIndex = (page - 1) * limit
  const endIndex = Math.min(startIndex + limit, totalRecords)

  return months.slice(startIndex, endIndex)
}
