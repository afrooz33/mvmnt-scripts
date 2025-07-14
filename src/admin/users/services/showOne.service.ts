import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { GetDealSalePurchaseQuery, GetProfileImageQuery } from '@app/src/shared/sql'
import { DealStatus, DealType } from '@app/src/users/deal/enums'
import { DealRatingStatus } from '@app/src/users/deal/review/enums'

export default async function (id: string): Promise<any> {
  try {
    const result: QueryBuilderDataInterface = new QueryBuilder({})
      .addFilter('id', id)
      .addRelation('profile')
      .useQuery(this.userRepository)
      .create()

    result.condition.select([
      'data.email as email',
      'data.brand_url as brand_url',
      'data.display_name as display_name',
      'data.account_type as account_type',
      'data.account_status as account_status',
      'data.total_donations',
      'data.gross_donations',
      'data.blocked_details as blocked_details',
      'data.last_login as last_login',
      'data.created as registered_date',
      'profile.social_accounts',
      'data.admin_memo as admin_memo',
      'profile.verification_status as verification_status',
      'profile.identity_verification_status as identity_verification_status',
      `${GetProfileImageQuery()}  profile_images`,
      `(SELECT 
        COALESCE(ROUND(AVG("data"."rating"), 1)::float, 0) AS "average_rating"
      FROM 
        "user_deal_review" "data" 
        LEFT JOIN "deals" "deal" ON "deal"."id" = "data"."dealId"
      WHERE
        "data"."status" NOT IN ('${DealRatingStatus.ENABLED}', '${DealRatingStatus.REPORTED}')
        AND "deal"."userId" = '${id}'
        AND "deal"."status" IN ('${DealStatus.DELETED}')
        AND "deal"."deal_type" = '${DealType.BUYNOW}') as sell_rating`,
      'data.rank as rank',
    ])

    result.condition.addSelect([
      `(${GetDealSalePurchaseQuery({
        userId: '"data"."id"',
        select: 'COALESCE(COUNT(DISTINCT "item_payment"."receiverId"), 0)',
      })}) as total_sell_count`,
    ])

    result.condition.addSelect([
      `(${GetDealSalePurchaseQuery({
        userId: '"data"."id"',
        select: 'COALESCE(COUNT(DISTINCT "item_payment"."senderId"), 0)',
      })}) as total_purchase_count`,
    ])

    return await result.condition.getRawOne()
  } catch (error) {
    return HandleErrors(error)
  }
}
