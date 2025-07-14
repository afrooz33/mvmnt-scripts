import { DONATION_STATUS } from '@app/src/donations/enums'

/**
 * @SQL - Get gross donation query
 * @param {string} condition - condition
 * @returns {string} - query
 */
export function GetGrossDonationQuery(condition: string): string {
  return `SELECT COALESCE(SUM("donation"."amount" + "donation"."system_fees")::float, 0)
    FROM
      "user_donations" AS "donation"
    WHERE ${condition} 
      AND "donation"."status" IN ('${DONATION_STATUS.COMPLETED}', '${DONATION_STATUS.SETTLED}')`
}
