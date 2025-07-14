import { Query } from '@app/src/shared/enums'
import { PaginateRO } from '@app/src/shared/dto'
import { GetUserDealSalesQuery } from '@app/src/shared/sql'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { AccountStatus } from '@app/src/users/user/enums'
import { DONATION_STATUS } from '@app/src/donations/enums'
import { ManualUserFilterDto } from '@app/src/admin/homepages/dto'

export default async function (query: ManualUserFilterDto): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.userRepository)
      .addRelation(Query.PROFILE)
      .addRelation(Query.PROFILE_IMAGES)
      .create()

    results.condition.select([
      '"data"."id" "id"',
      '"data"."username" "username"',
      '"data"."created" "registered_at"',
      '"data"."last_login" "last_login"',
      '"profile_images"."url" "profile_image"',
      '"data"."display_name" "display_name"',
      '"data"."account_type" "account_type"',
      '"data"."account_status" "account_status"',
      '"data"."blocked_details" "blocked_details"',
      '"profile"."social_accounts" "social_accounts"',
      '"profile"."verification_status" "verification_status"',
      '"profile"."identity_verification_status" "identity_verification_status"',
      'data.total_donations',
      'data.gross_donations',
    ])

    results.condition.andWhere('"data"."account_status" IN (:...account_status)', {
      account_status: [AccountStatus.ENABLED, AccountStatus.BLOCKED],
    })

    if (query.keyword) {
      // ToDo: add sns username search + filter based on sns follower
      results.condition.andWhere(
        `("data"."username" ILIKE :keyword OR "profile"."introduction" ILIKE :keyword)`,
        { keyword: `%${query.keyword}%` },
      )
    }

    if (query.categories) {
      results.condition.andWhere(
        `EXISTS (SELECT 1 FROM "deals" WHERE "deals"."userId" = "data"."id" AND "deals"."categoryId" IN (:...categories))`,
        { categories: query.categories },
      )
    }

    if (query.brands) {
      results.condition.andWhere(
        `EXISTS (SELECT 1 FROM "deals" WHERE "deals"."userId" = "data"."id" AND "deals"."brandId" IN (:...brands))`,
        { brands: query.brands },
      )
    }

    if (query.deal_type) {
      results.condition.andWhere(
        `EXISTS (SELECT 1 FROM "deals" WHERE "deals"."userId" = "data"."id" AND "deals"."deal_type" = :deal_type)`,
        { deal_type: query.deal_type },
      )
    }

    const gross_donation_query = `"data"."id" IN (SELECT
        "userId"
      FROM
        "user_donations" "donations"
      WHERE
        "status" IN ('${DONATION_STATUS.COMPLETED}', '${DONATION_STATUS.SETTLED}')
        AND "userId" = "data"."id"
        GROUP BY
          "userId"
        HAVING COALESCE(SUM(amount), 0)::float`

    if (query?.gross_donations?.start) {
      results.condition.andWhere(`${gross_donation_query} >= :donation_start)`, {
        donation_start: query?.gross_donations?.start,
      })
    }

    if (query?.gross_donations?.end) {
      results.condition.andWhere(`${gross_donation_query} <= :donation_end)`, {
        donation_end: query?.gross_donations?.end,
      })
    }

    if (query?.total_sales?.start) {
      results.condition.andWhere(
        `(${GetUserDealSalesQuery({
          userId: `"data"."id"`,
          select: 'COALESCE(SUM("item_payment"."deal_amount"), 0)',
        })}) >= :total_sales_start`,
        {
          total_sales_start: query.total_sales.start,
        },
      )
    }

    if (query?.total_sales?.end) {
      results.condition.andWhere(
        `(${GetUserDealSalesQuery({
          userId: `"data"."id"`,
          select: 'COALESCE(SUM("item_payment"."deal_amount"), 0)',
        })}) <= :total_sales_end`,
        {
          total_sales_end: query.total_sales.end,
        },
      )
    }

    if (query?.contribution_amount?.start) {
      results.condition.andWhere(
        `"data"."id" IN (SELECT "userId"
          FROM (
              SELECT "payment"."receiverId" AS "userId"
              FROM "user_donations" "donations"
              INNER JOIN "user_deal_item_payment" "payment"
                ON "donations"."userDealItemPaymentId" = "payment"."id"
              WHERE "donations"."status" = '${DONATION_STATUS.COMPLETED}' 
              AND "payment"."receiverId" = "data"."id" 
              GROUP BY "payment"."receiverId"
              HAVING COALESCE(SUM(amount), 0)::float >= :contribution_amount_start
              
              UNION ALL
              
              SELECT "donations"."userId"
              FROM "user_donations" "donations"
              WHERE "donations"."status" = '${DONATION_STATUS.COMPLETED}' 
              AND "donations"."userId" = "data"."id" 
              GROUP BY "donations"."userId" 
              HAVING COALESCE(SUM(amount), 0)::float >= :contribution_amount_start
          ))`,
        {
          contribution_amount_start: query.contribution_amount.start,
        },
      )
    }

    if (query?.contribution_amount?.end) {
      results.condition.andWhere(
        `"data"."id" IN (SELECT "userId"
          FROM (
              SELECT "payment"."receiverId" AS "userId"
              FROM "user_donations" "donations"
              INNER JOIN "user_deal_item_payment" "payment"
                ON "donations"."userDealItemPaymentId" = "payment"."id"
              WHERE "donations"."status" = '${DONATION_STATUS.COMPLETED}' 
              AND "payment"."receiverId" = "data"."id" 
              GROUP BY "payment"."receiverId" 
              HAVING COALESCE(SUM(amount), 0)::float <= :contribution_amount_end
              
              UNION ALL
              
              SELECT "donations"."userId"
                FROM "user_donations" "donations"
              WHERE "donations"."status" = '${DONATION_STATUS.COMPLETED}' 
              AND "donations"."userId" = "data"."id" 
              GROUP BY "donations"."userId" 
              HAVING COALESCE(SUM(amount), 0)::float <= :contribution_amount_end
          ))`,
        {
          contribution_amount_end: query.contribution_amount.end,
        },
      )
    }

    return await this.rawPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
