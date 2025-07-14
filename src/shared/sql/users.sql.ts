/**
 * @SQL - Get user total sales
 * @param {n/a}
 * @returns {string} - query
 */

import { DONATION_STATUS } from '@app/src/donations/enums'

export function GetUserContrinutionQuery(): string {
  return `(SELECT
    COALESCE(SUM("d"."amount"), 0) AS total_contribution
  FROM "user_donations" "d"
  LEFT JOIN "user_deal_item_payment" "payment" ON "d"."userDealItemPaymentId" = "payment"."id"
  WHERE "d"."status" IN ('${DONATION_STATUS.COMPLETED}', '${DONATION_STATUS.SETTLED}')
    AND ("payment"."senderId" = "data"."id" OR "payment"."receiverId" = "data"."id"))`
}
