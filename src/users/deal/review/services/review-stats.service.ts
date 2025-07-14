import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { DealStatus, DealType } from '@app/src/users/deal/enums'
import { DealRatingStatus } from '@app/src/users/deal/review/enums'

export default async function (userId) {
  try {
    const query = `
      SELECT 
        ROUND(AVG("data"."rating"), 1)::float AS "average_rating",
        COUNT("data"."rating")::int AS "rating_count"
      FROM 
        "user_deal_review" "data" 
        LEFT JOIN "deals" "deal" ON "deal"."id" = "data"."dealId"
      WHERE
        "data"."status" IN ($1, $2)
        AND "deal"."userId" = $3
        AND "deal"."status" IN ($4, $5) 
        AND "deal"."deal_type" = $6;
    `
    const values = [
      DealRatingStatus.ENABLED,
      DealRatingStatus.REPORTED,
      userId,
      DealStatus.ON_DEAL,
      DealStatus.ENDED,
      DealType.BUYNOW,
    ]

    const rating = await this.entityManager.query(query, values)

    return rating && rating.length ? rating[0] : { average_rating: 0, rating_count: 0 }
  } catch (error) {
    return HandleErrors(error)
  }
}
