import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { SuccessRO } from '@app/src/shared/dto'
import { QueryDto } from '@app/src/nonprofit/payment/dto'
import { DONATION_STATUS } from '@app/src/donations/enums'

const getNonprofitUserQuery = (userId: string) => {
  return `"donation"."donationProjectId" IN (
    SELECT
      "id"
    FROM
      "donation_projects"
    WHERE "userId" = '${userId}'
  )`
}

const getTotalDonationQuery = (query: QueryDto, userId: string, apply_filter = false) => {
  let query_condition = ''

  if (apply_filter) {
    if (query?.donation_date?.leading_date && query?.donation_date?.trailing_date) {
      query_condition = ` AND "donation"."created" BETWEEN '${query?.donation_date?.leading_date}' AND '${query?.donation_date?.trailing_date}'`
    } else if (query?.donation_date?.leading_date) {
      query_condition = ` AND "donation"."created" >= '${query?.donation_date?.leading_date}'`
    } else if (query?.donation_date?.trailing_date) {
      query_condition = ` AND "donation"."created" <= '${query?.donation_date?.trailing_date}'`
    }
  }

  return `(
    SELECT
      COALESCE(SUM("donation"."amount"), 0)
    FROM
      "user_donations" "donation"
    WHERE
      "donation"."status" IN ('${DONATION_STATUS.COMPLETED}', '${DONATION_STATUS.SETTLED}')
        AND (${getNonprofitUserQuery(userId)})${query_condition})`
}

const getTotalDonorQuery = (query: QueryDto, userId: string, apply_filter = false) => {
  let query_condition = ''

  if (apply_filter) {
    if (query?.donation_date?.leading_date && query?.donation_date?.trailing_date) {
      query_condition = ` AND "donation"."created" BETWEEN '${query?.donation_date?.leading_date}' AND '${query?.donation_date?.trailing_date}'`
    } else if (query?.donation_date?.leading_date) {
      query_condition = ` AND "donation"."created" >= '${query?.donation_date?.leading_date}'`
    } else if (query?.donation_date?.trailing_date) {
      query_condition = ` AND "donation"."created" <= '${query?.donation_date?.trailing_date}'`
    }
  }

  return `(SELECT
      COALESCE(COUNT("donation"."id"), 0)::float
    FROM
      "user_donations" "donation"
    WHERE
      "donation"."status" IN ('${DONATION_STATUS.COMPLETED}', '${DONATION_STATUS.SETTLED}')
        AND (${getNonprofitUserQuery(userId)})${query_condition})`
}

export default async function (query: QueryDto, userId: string): Promise<SuccessRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.donationsRepository)
      .create()

    results.condition.andWhere(
      `"data"."status" IN ('${DONATION_STATUS.COMPLETED}', '${DONATION_STATUS.SETTLED}')`,
    )

    results.condition.select([
      `${getTotalDonationQuery(query, userId, false)} "total_donation"`,
      `${getTotalDonorQuery(query, userId, false)} "total_donor"`,
      `${getTotalDonationQuery(query, userId, true)} "total_donation_by_date"`,
      `${getTotalDonorQuery(query, userId, true)} "total_donor_by_date"`,
    ])

    results.condition.limit(1)

    return {
      success: true,
      data: await results.condition.getRawOne(),
      message: '',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
