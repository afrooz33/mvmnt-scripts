import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { GetDealDonationQuery, GetUserDealSalesQuery } from '@app/src/shared/sql'

export default async function (id: string) {
  try {
    const results: any = {
      rank: 0,
      grade: '',
      ranking: '',
      total_stars: 0,
      direct_donations: 0,
      total_deals_sold: 0,
      total_deals_bought: 0,
    }

    const ranking = await this.entityManager.query(
      `SELECT
        "grade",
        "rank",
        (SELECT COALESCE(SUM("stars"), 0) FROM "user_stars" WHERE "userId" = '${id}') AS "total_stars"
      FROM
        "users"
      WHERE "id" = '${id}'`,
    )

    const direct_donations = await this.entityManager.query(
      `(${GetDealDonationQuery({
        userId: id,
        isDirect: true,
        columnMatchCondition: `"donation"."userId" = '${id}'`,
        select: 'COALESCE(SUM("donation"."amount"), 0)::float AS "total_amount"',
      })})`,
    )

    const deal_sell = await this.entityManager.query(
      GetUserDealSalesQuery({
        userId: id,
        select: 'COALESCE(SUM("item_payment"."deal_amount"), 0)::float AS "total_deals_sold"',
      }),
    )

    const deal_buy = await this.entityManager.query(
      GetUserDealSalesQuery({
        userId: id,
        isPurchase: true,
        select: 'COALESCE(SUM("item_payment"."deal_amount"), 0)::float AS "total_deals_bought"',
      }),
    )

    if (ranking.length > 0) {
      results.rank = ranking[0].rank
      results.grade = ranking[0].grade
      results.total_stars = ranking[0].total_stars
    }

    if (direct_donations.length > 0) {
      results.direct_donations = direct_donations[0].total_amount
    }

    if (deal_sell.length > 0) {
      results.total_deals_sold = deal_sell[0].total_deals_sold
    }

    if (deal_buy.length > 0) {
      results.total_deals_bought = deal_buy[0].total_deals_bought
    }

    return results
  } catch (error) {
    return HandleErrors(error)
  }
}
