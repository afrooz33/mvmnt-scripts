import { GetUserDealSalesQuery } from '@app/src/shared/sql'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { AccountStatus } from '@app/src/users/user/enums'
import { DONATION_STATUS } from '@app/src/donations/enums'
import { FollowType } from '@app/src/users/follower/enums'
import { Conditions, Fields } from '@app/src/admin/homepages/enums'
import { HomepagesEntity } from '@app/src/admin/homepages/entities/homepages.entity'
import { HomepageSearchConditionsEntity } from '@app/src/admin/homepages/entities/search-conditions.entity'

export default async function (
  homepage: HomepagesEntity,
  results: QueryBuilderDataInterface,
): Promise<any> {
  const filters: HomepageSearchConditionsEntity[] = homepage.search_conditions

  for (const filter in filters) {
    const field = filters[filter].field
    const condition = filters[filter].condition
    const value = filters[filter].values

    switch (field) {
      case Fields.DEAL_NAME:
        if (condition === Conditions.CONTAINS) {
          results.condition.andWhere(
            `"data"."id" IN (SELECT "userId" FROM "deals" WHERE "deals"."name" ILIKE :deal_name)`,
            {
              deal_name: `%${value}%`,
            },
          )
        } else if (condition === Conditions.DOES_NOT_CONTAIN) {
          results.condition.andWhere(
            `"data"."id" NOT IN (SELECT "userId" FROM "deals" WHERE "deals"."name" ILIKE :not_deal_name)`,
            {
              not_deal_name: `%${value}%`,
            },
          )
        }
        break
      case Fields.DEAL_CATEGORY:
        if (condition === Conditions.CONTAINS) {
          results.condition.andWhere(
            `"data"."id" IN (SELECT "userId" FROM "deals" WHERE "deals"."categoryId" = :deal_category)`,
            {
              deal_category: value,
            },
          )
        }
        break
      case Fields.DEAL_BRAND:
        if (condition === Conditions.CONTAINS) {
          results.condition.andWhere(
            `"data"."id" IN (SELECT "userId" FROM "deals" WHERE "deals"."brandId" = :deal_brand)`,
            {
              deal_brand: value,
            },
          )
        }
        break
      case Fields.DEAL_TYPE:
        if (condition === Conditions.CONTAINS) {
          results.condition.andWhere(
            `"data"."id" IN (SELECT "userId" FROM "deals" WHERE "deals"."deal_type" = :deal_type)`,
            {
              deal_type: value,
            },
          )
        } else if (condition === Conditions.DOES_NOT_CONTAIN) {
          results.condition.andWhere(
            `"data"."id" NOT IN (SELECT "userId" FROM "deals" WHERE "deals"."deal_type" = :not_deal_type)`,
            {
              not_deal_type: value,
            },
          )
        }
        break
      case Fields.USER_TYPE:
        if (condition === Conditions.IS_EQUAL_TO) {
          results.condition.andWhere(`"data"."account_type" = :user_type`, {
            user_type: value,
          })
        } else if (condition === Conditions.IS_NOT_EQUAL_TO) {
          results.condition.andWhere(`"data"."account_type" != :not_user_type`, {
            not_user_type: value,
          })
        }
        break
      case Fields.DONATED_TO:
        if (condition === Conditions.CONTAINS) {
          results.condition.andWhere(
            `"data"."id" IN (SELECT "userId" FROM "user_donations" WHERE "donationProjectId"::text = '${value}')`,
          )
        } else if (condition === Conditions.DOES_NOT_CONTAIN) {
          results.condition.andWhere(
            `"data"."id" NOT IN (SELECT "userId" FROM "user_donations" WHERE "donationProjectId"::text != '${value}')`,
          )
        }
        break
      case Fields.DONATION_AMOUNT:
        if (condition === Conditions.IS_GREATER_THAN) {
          results.condition.andWhere(
            `"data"."id" IN (SELECT "userId" FROM "user_donations" WHERE "status" IN ('${DONATION_STATUS.COMPLETED}', '${DONATION_STATUS.SETTLED}') AND "userId" = "data"."id" GROUP BY "userId" HAVING COALESCE(SUM(amount), 0)::float > :greater_donation_amount)`,
            {
              greater_donation_amount: value,
            },
          )
        } else if (condition === Conditions.IS_LESS_THAN) {
          results.condition.andWhere(
            `"data"."id" IN (SELECT "userId" FROM "user_donations" WHERE "status" IN ('${DONATION_STATUS.COMPLETED}', '${DONATION_STATUS.SETTLED}') AND "userId" = "data"."id" GROUP BY "userId" HAVING COALESCE(SUM(amount), 0)::float < :less_donation_amount)`,
            {
              less_donation_amount: value,
            },
          )
        }
        break
      case Fields.CONTRIBUTION_AMOUNT:
        if (condition === Conditions.IS_GREATER_THAN) {
          results.condition.andWhere(
            `"data"."id" IN (SELECT "userId"
              FROM (
                  SELECT "receiverId" AS "userId"
                  FROM "user_donations" "donation"
                  INNER JOIN "user_deal_item_payment" "payment" ON "payment"."userId" = "donation"."userDealItemPaymentId"
                  WHERE "donation"."status" IN ('${DONATION_STATUS.COMPLETED}', '${DONATION_STATUS.SETTLED}')
                  AND "payment"."receiverId" = "data"."id" 
                  GROUP BY "payment"."receiverId" 
                  HAVING COALESCE(SUM(amount), 0)::float > :greater_contribution_amount
                  
                  UNION ALL
                  
                  SELECT "donation"."userId"
                  FROM "user_donations" "donation"
                  WHERE "donation"."status" IN ('${DONATION_STATUS.COMPLETED}', '${DONATION_STATUS.SETTLED}')
                  AND "donation"."userId" = "data"."id" 
                  GROUP BY "donation"."userId" 
                  HAVING COALESCE(SUM(amount), 0)::float > :greater_contribution_amount
              ))`,
            {
              greater_contribution_amount: value,
            },
          )
        } else if (condition === Conditions.IS_LESS_THAN) {
          results.condition.andWhere(
            `"data"."id" IN (SELECT "userId"
              FROM (
                  SELECT "receiverId" AS "userId"
                  FROM "user_donations" "donation"
                  INNER JOIN "user_deal_item_payment" "payment" ON "payment"."userId" = "donation"."userDealItemPaymentId"
                  WHERE "donation"."status" IN ('${DONATION_STATUS.COMPLETED}', '${DONATION_STATUS.SETTLED}')
                  AND "payment"."receiverId" = "data"."id" 
                  GROUP BY "payment"."receiverId" 
                  HAVING COALESCE(SUM(amount), 0)::float < :less_contribution_amount
                  
                  UNION ALL
                  
                  SELECT "donation"."userId"
                  FROM "user_donations" "donation"
                  WHERE "donation"."status" IN ('${DONATION_STATUS.COMPLETED}', '${DONATION_STATUS.SETTLED}')
                  AND "donation"."userId" = "data"."id" 
                  GROUP BY "donation"."userId" 
                  HAVING COALESCE(SUM(amount), 0)::float < :less_contribution_amount
              ))`,
            {
              less_contribution_amount: value,
            },
          )
        }
        break
      case Fields.TOTAL_SALES:
        if (condition === Conditions.IS_GREATER_THAN) {
          results.condition.andWhere(
            `(${GetUserDealSalesQuery({
              userId: `"data"."id"`,
              select: 'COALESCE(SUM("item_payment"."deal_amount"), 0)',
            })}) > :greater_total_sales`,
            {
              greater_total_sales: value,
            },
          )
        } else if (condition === Conditions.IS_LESS_THAN) {
          results.condition.andWhere(
            `(${GetUserDealSalesQuery({
              userId: `"data"."id"`,
              select: 'COALESCE(SUM("item_payment"."deal_amount"), 0)',
            })}) < :less_total_sales`,
            {
              less_total_sales: value,
            },
          )
        }
        break
      case Fields.USER_MVMNT_FOLLOWERS:
        results.condition.leftJoin(
          `(SELECT COALESCE(COUNT(*), 0) as "follower_count", "followerId" FROM "users_followers" WHERE "type" = '${FollowType.PROFILE}' GROUP BY "followerId")`,
          'follower',
          `"follower"."followerId" = "data"."id"`,
        )
        if (condition === Conditions.IS_GREATER_THAN) {
          results.condition.andWhere(`"follower"."follower_count" > :follower_count`, {
            follower_count: value,
          })
        } else if (condition === Conditions.IS_LESS_THAN) {
          results.condition.andWhere(`"follower"."follower_count" < :less_follower_count`, {
            less_follower_count: value,
          })
        }
        break
      case Fields.SORT_ORDER:
        const donationQuery = `(SELECT
            COALESCE(SUM(amount), 0)::float
          FROM "user_donations"
          WHERE "status" IN ('${DONATION_STATUS.COMPLETED}', '${DONATION_STATUS.SETTLED}')
            AND "userId" = "data"."id")`

        switch (condition) {
          case Conditions.DONATION_AMOUNT_DESC:
            results.condition.addOrderBy(donationQuery, 'DESC')
            break
          case Conditions.DONATION_AMOUNT_ASC:
            results.condition.addOrderBy(donationQuery, 'ASC')
            break
          case Conditions.CONTRIBUTION_AMOUNT_DESC:
            results.condition.addOrderBy(
              `(
                SELECT 
                  COALESCE(
                    SUM("donation"."amount"), 
                    0
                  ):: float
                FROM 
                  (
                    SELECT 
                      COALESCE(
                        SUM("donation"."amount"), 
                        0
                      ):: float as "amount"
                    FROM 
                      "user_donations" "donation"
                    INNER JOIN "user_deal_item_payment" "payment" ON "payment"."userId" = "donation"."userDealItemPaymentId"
                    WHERE 
                      "donation"."status" IN ('${DONATION_STATUS.COMPLETED}', '${DONATION_STATUS.SETTLED}')
                      AND "payment"."receiverId" = "data"."id" 
                    GROUP BY 
                      "payment"."receiverId"
                    UNION ALL 
                    SELECT 
                      COALESCE(
                        SUM("donation"."amount"), 
                        0
                      ):: float as "amount"
                    FROM 
                      "user_donations" "donation"
                    WHERE 
                      "donation"."status" IN ('${DONATION_STATUS.COMPLETED}', '${DONATION_STATUS.SETTLED}')
                      AND "donation"."userId" = "data"."id" 
                    GROUP BY 
                      "donation"."userId"
                  )
              )`,
              'DESC',
            )
            break
          case Conditions.CONTRIBUTION_AMOUNT_ASC:
            results.condition.addOrderBy(
              `(
                SELECT 
                  COALESCE(
                    SUM("donation"."amount"), 
                    0
                  ):: float
                FROM 
                  (
                    SELECT 
                      COALESCE(
                        SUM("donation"."amount"), 
                        0
                      ):: float as "amount"
                    FROM 
                      "user_donations" "donation"
                    INNER JOIN "user_deal_item_payment" "payment" ON "payment"."userId" = "donation"."userDealItemPaymentId"
                    WHERE 
                      "donation"."status" IN ('${DONATION_STATUS.COMPLETED}', '${DONATION_STATUS.SETTLED}')
                      AND "payment"."receiverId" = "data"."id" 
                    GROUP BY 
                      "payment"."receiverId"
                    UNION ALL 
                    SELECT 
                      COALESCE(
                        SUM("donation"."amount"), 
                        0
                      ):: float as "amount"
                    FROM 
                      "user_donations" "donation"
                    WHERE 
                      "donation"."status" IN ('${DONATION_STATUS.COMPLETED}', '${DONATION_STATUS.SETTLED}')
                      AND "donation"."userId" = "data"."id" 
                    GROUP BY 
                      "donation"."userId"
                  )
              )`,
              'ASC',
            )
            break
          case Conditions.TOTAL_SALES_DESC:
            results.condition.addOrderBy(
              `(${GetUserDealSalesQuery({
                userId: `"data"."id"`,
                select: 'COALESCE(SUM("item_payment"."deal_amount"), 0)',
              })})`,
              'DESC',
            )
            break
          case Conditions.TOTAL_SALES_ASC:
            results.condition.addOrderBy(
              `(${GetUserDealSalesQuery({
                userId: `"data"."id"`,
                select: 'COALESCE(SUM("item_payment"."deal_amount"), 0)',
              })})`,
              'ASC',
            )
            break
          case Conditions.MVMNT_FOLLOWERS_DESC:
            results.condition.leftJoin(
              `(SELECT COALESCE(COUNT(*), 0) as "follower_count", "followerId" FROM "users_followers" WHERE "type" = '${FollowType.PROFILE}' GROUP BY "followerId")`,
              'follower',
              `"follower"."followerId" = "data"."id"`,
            )

            results.condition.addOrderBy(`"follower"."follower_count"`, 'ASC')
            break
          case Conditions.MVMNT_FOLLOWERS_ASC:
            results.condition.leftJoin(
              `(SELECT COALESCE(COUNT(*), 0) as "follower_count", "followerId" FROM "users_followers" WHERE "type" = '${FollowType.PROFILE}' GROUP BY "followerId")`,
              'follower',
              `"follower"."followerId" = "data"."id"`,
            )

            results.condition.addOrderBy(`"follower"."follower_count"`, 'ASC')
            break
          // ToDo dynamic SNS follower sort
        }
        break
      default:
        break
    }
  }

  results.condition.select([
    '"data"."id" as "user_id"',
    '"data"."username"',
    '"data"."display_name"',
    '"data"."account_type"',
    `(SELECT
        "images"."url"
      FROM
        "images"
      WHERE "images"."id" = "profile"."profileImagesId" LIMIT 1) as "profile_image"`,
  ])

  results.condition.andWhere(`"data"."account_status" = :account_status`, {
    account_status: AccountStatus.ENABLED,
  })

  return results
}
