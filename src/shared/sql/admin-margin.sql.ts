/**
 * @SQL - Functions to return admin margin top stats
 * @param {string} N/A
 * @returns {string} - query
 */
import { TopStatQueryDto } from '@app/src/admin/payments/dto'
import { DONATION_STATUS } from '@app/src/donations/enums'

export function StatTotalDonorQuery(): string {
  return `(SELECT
      COALESCE(COUNT(DISTINCT "donation"."userId"), 0)::float
    FROM
      "user_donations" "donation"
    WHERE
      "donation"."status" IN ('${DONATION_STATUS.COMPLETED}', '${DONATION_STATUS.SETTLED}'))`
}

export function StatTotalAdminMarginQuery(query: TopStatQueryDto, apply_filter = false): string {
  let query_condition = ''

  if (apply_filter) {
    if (query?.donation_date?.start && query?.donation_date?.end) {
      query_condition = ` AND "donation"."created" BETWEEN '${query?.donation_date?.start}' AND '${query?.donation_date?.end}'`
    } else if (query?.donation_date?.start) {
      query_condition = ` AND "donation"."created" >= '${query?.donation_date?.start}'`
    } else if (query?.donation_date?.end) {
      query_condition = ` AND "donation"."created" <= '${query?.donation_date?.end}'`
    }
  }

  return `(SELECT
      COALESCE(SUM("donation"."amount") - SUM("donation"."system_fees"), 0)::float
    FROM
      "user_donations" "donation"
    WHERE
      "donation"."status" IN ('${DONATION_STATUS.COMPLETED}', '${DONATION_STATUS.SETTLED}')${query_condition})`
}

export function StatTotalDonationQuery(query: TopStatQueryDto, apply_filter = false): string {
  let query_condition = ''

  if (apply_filter) {
    if (query?.donation_date?.start && query?.donation_date?.end) {
      query_condition = ` AND "donation"."created" BETWEEN '${query?.donation_date?.start}' AND '${query?.donation_date?.end}'`
    } else if (query?.donation_date?.start) {
      query_condition = ` AND "donation"."created" >= '${query?.donation_date?.start}'`
    } else if (query?.donation_date?.end) {
      query_condition = ` AND "donation"."created" <= '${query?.donation_date?.end}'`
    }
  }

  return `(SELECT
      COALESCE(SUM("donation"."amount"), 0)::float
    FROM
      "user_donations" "donation"
    WHERE
      "donation"."status" IN ('${DONATION_STATUS.COMPLETED}', '${DONATION_STATUS.SETTLED}')${query_condition})`
}
