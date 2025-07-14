import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import {
  GetTotalBidsQuery,
  GetCurrentBidQuery,
  GetTotalLikesQuery,
  GetDealQuantityQuery,
  GetDonationAmountQuery,
  GetGrossDonationsQuery,
  GetDealFirstImageQuery,
  GetUserDealSalesQuery,
} from '@app/src/shared/sql'
import { DealStatus } from '@app/src/users/deal/enums'
import { DONATION_STATUS } from '@app/src/donations/enums'
import { FollowType } from '@app/src/users/follower/enums'
import { Conditions, Fields } from '@app/src/admin/homepages/enums'
import { HomepagesEntity } from '@app/src/admin/homepages/entities/homepages.entity'
import { HomepageSearchConditionsEntity } from '@app/src/admin/homepages/entities/search-conditions.entity'
import { DonationProjectStatus } from '@app/src/nonprofit/donation-projects/enums'

export default async function (
  homepage: HomepagesEntity,
  results: QueryBuilderDataInterface,
): Promise<any> {
  const filters: HomepageSearchConditionsEntity[] = homepage.search_conditions

  for (const filter of filters) {
    const field = filter.field
    const condition = filter.condition
    const value = filter.values

    switch (field) {
      case Fields.DEAL_NAME:
        if (condition === Conditions.CONTAINS) {
          results.condition.andWhere(`"data"."name" ILIKE :deal_name`, {
            deal_name: `%${value}%`,
          })
        } else if (condition === Conditions.DOES_NOT_CONTAIN) {
          results.condition.andWhere(`"data"."name" NOT ILIKE :not_deal_name`, {
            not_deal_name: `%${value}%`,
          })
        }

        break
      case Fields.DEAL_BRAND:
        results.condition.leftJoin('data.brand', 'brand', '"brand"."id" = "data"."brandId"')

        if (condition === Conditions.IS_EQUAL_TO) {
          results.condition.andWhere('"brand"."name" = :brand', {
            brand: value,
          })
        }
        break
      case Fields.DEAL_CATEGORY:
        results.condition.leftJoin(
          'data.category',
          'category',
          '"category"."id" = "data"."categoryId"',
        )

        if (condition === Conditions.IS_EQUAL_TO) {
          results.condition.andWhere('"category"."name" = :deal_category', {
            deal_category: value,
          })
        }
        break
      case Fields.DEAL_TYPE:
        if (condition === Conditions.IS_EQUAL_TO) {
          results.condition.andWhere('"data"."deal_type" = :deal_type', {
            deal_type: value,
          })
        } else if (condition === Conditions.IS_NOT_EQUAL_TO) {
          results.condition.andWhere('"data"."deal_type" != :not_deal_type', {
            not_deal_type: value,
          })
        }
        break
      case Fields.DEAL_PRICE:
        if (condition === Conditions.IS_GREATER_THAN) {
          results.condition.andWhere(`"data"."starting_price" > :starting_price`, {
            starting_price: value,
          })
        } else if (condition === Conditions.IS_LESS_THAN) {
          results.condition.andWhere(`"data"."starting_price" < :less_starting_price`, {
            less_starting_price: value,
          })
        }
        break
      case Fields.DEAL_CURRENCY:
        if (condition === Conditions.IS_EQUAL_TO) {
          results.condition.andWhere('"data"."currency" = :deal_currency', {
            deal_currency: value,
          })
        }
        break
      case Fields.DEAL_STATUS:
        if (condition === Conditions.IS_EQUAL_TO) {
          results.condition.andWhere(`"data"."status" = :deal_status`, {
            deal_status: value,
          })
        } else if (condition === Conditions.IS_NOT_EQUAL_TO) {
          results.condition.andWhere(`"data"."status" != :not_deal_status`, {
            not_deal_status: value,
          })
        }
        break
      case Fields.DONATED_TO:
        results.condition.leftJoin(
          `(
          SELECT
            "user_donations"."donationProjectId",
            "payment"."dealId"
          FROM
            "user_donations"
          INNER JOIN "user_deal_item_payment" "payment" ON "payment"."id" = "user_donations"."userDealItemPaymentId"
          WHERE
            "user_donations"."status" IN ('${DONATION_STATUS.COMPLETED}', '${DONATION_STATUS.SETTLED}')
          )`,
          'donations',
          `"donations"."dealId" = "data"."id"`,
        )

        const donationProjectId = `(SELECT "id" FROM "donation_projects" WHERE "status" NOT IN ('${DonationProjectStatus.DELETED}', '${DonationProjectStatus.DRAFT}', '${DonationProjectStatus.SCHEDULED}'))`

        if (condition === Conditions.CONTAINS) {
          results.condition.andWhere(`"donations"."donationProjectId" IN (${donationProjectId})`)
        } else if (condition === Conditions.DOES_NOT_CONTAIN) {
          results.condition.andWhere(
            `"donations"."donationProjectId" NOT IN (${donationProjectId})`,
          )
        }
        break
      case Fields.TOTAL_LIKES:
        //deal total likes count
        if (condition === Conditions.IS_GREATER_THAN) {
          results.condition.andWhere(`(${GetTotalLikesQuery('"data"')}) > :total_likes`, {
            total_likes: parseInt(value, 10),
          })
        } else if (condition === Conditions.IS_LESS_THAN) {
          results.condition.andWhere(`(${GetTotalLikesQuery('"data"')}) < :less_total_likes`, {
            less_total_likes: parseInt(value, 10),
          })
        }
        break
      case Fields.USER_TYPE:
        //seller account type
        if (condition === Conditions.IS_EQUAL_TO) {
          results.condition.andWhere(`"user"."account_type" = :account_type`, {
            account_type: value,
          })
        } else if (condition === Conditions.IS_NOT_EQUAL_TO) {
          results.condition.andWhere(`"user"."account_type" != :not_account_type`, {
            not_account_type: value,
          })
        }
        break
      case Fields.DONATION_AMOUNT:
        //deals total donation
        if (condition === Conditions.IS_GREATER_THAN) {
          results.condition.andWhere(`(${GetGrossDonationsQuery('"data"')}) > :donation_amount`, {
            donation_amount: value,
          })
        } else if (condition === Conditions.IS_LESS_THAN) {
          results.condition.andWhere(
            `(${GetGrossDonationsQuery('"data"')}) < :less_donation_amount`,
            {
              less_donation_amount: value,
            },
          )
        }
        break
      case Fields.TOTAL_SALES:
        //seller total sales
        if (condition === Conditions.IS_GREATER_THAN) {
          results.condition.andWhere(
            `(${GetUserDealSalesQuery({
              userId: `"user"."id"`,
              select: 'COALESCE(SUM("item_payment"."deal_amount"), 0)',
            })}) > :total_sales`,
            {
              total_sales: value,
            },
          )
        } else if (condition === Conditions.IS_LESS_THAN) {
          results.condition.andWhere(
            `(${GetUserDealSalesQuery({
              userId: `"user"."id"`,
              select: 'COALESCE(SUM("item_payment"."deal_amount"), 0)',
            })}) < :less_total_sales`,
            {
              less_total_sales: value,
            },
          )
        }
        break
      case Fields.USER_MVMNT_FOLLOWERS:
        //seller mvmt followers
        results.condition.leftJoin(
          `(SELECT COALESCE(COUNT(*), 0) as "follower_count", "followerId" FROM "users_followers" WHERE "type" = '${FollowType.PROFILE}' GROUP BY "followerId")`,
          'follower',
          `"follower"."followerId" = "data"."userId"`,
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
      // ToDo dynamic SNS follower condition
      // case Fields.USER_SNS_FOLLOWERS:
      //   if (condition === Conditions.IS_GREATER_THAN) {
      //     results.condition.andWhere(
      //       `"user"."sns_follower_count" > :sns_follower_count`,
      //       {
      //         sns_follower_count: value,
      //       },
      //     )
      //   } else if (condition === Conditions.IS_LESS_THAN) {
      //     results.condition.andWhere(
      //       `"user"."sns_follower_count" < :less_sns_follower_count`,
      //       {
      //         less_sns_follower_count: value,
      //       },
      //     )
      //   }
      //   break
      case Fields.SORT_ORDER:
        switch (condition) {
          case Conditions.DEAL_START_DATE_ASC:
            results.condition.addOrderBy(`"data"."start_date"`, 'ASC')
            break
          case Conditions.DEAL_START_DATE_DESC:
            results.condition.addOrderBy(`"data"."start_date"`, 'DESC')
            break
          case Conditions.DEAL_END_DATE_ASC:
            results.condition.addOrderBy(`"data"."end_date"`, 'ASC')
            break
          case Conditions.DEAL_END_DATE_DESC:
            results.condition.addOrderBy(`"data"."end_date"`, 'DESC')
            break
          case Conditions.DEAL_PRICE_ASC:
            results.condition.addOrderBy(`"data"."starting_price"`, 'ASC')
            break
          case Conditions.DEAL_PRICE_DESC:
            results.condition.addOrderBy(`"data"."starting_price"`, 'DESC')
            break
          case Conditions.LIKE_COUNT_ASC:
            results.condition.addOrderBy(`(${GetTotalLikesQuery(`"data"`)})`, 'ASC')
            break
          case Conditions.LIKE_COUNT_DESC:
            results.condition.addOrderBy(`(${GetTotalLikesQuery(`"data"`)})`, 'DESC')
            break
          case Conditions.DONATION_AMOUNT_ASC:
            results.condition.addOrderBy(`(${GetGrossDonationsQuery(`"data"`)})`, 'ASC')
            break
          case Conditions.DONATION_AMOUNT_DESC:
            results.condition.addOrderBy(`(${GetGrossDonationsQuery(`"data"`)})`, 'DESC')
            break
          case Conditions.TOTAL_SALES_ASC:
            results.condition.addOrderBy(
              `(${GetUserDealSalesQuery({
                userId: `"user"."id"`,
                select: 'COALESCE(SUM("item_payment"."deal_amount"), 0)',
              })})`,
              'ASC',
            )
            break
          case Conditions.TOTAL_SALES_DESC:
            results.condition.addOrderBy(
              `(${GetUserDealSalesQuery({
                userId: `"user"."id"`,
                select: 'COALESCE(SUM("item_payment"."deal_amount"), 0)',
              })})`,
              'DESC',
            )
            break
          case Conditions.MVMNT_FOLLOWERS_ASC:
            results.condition.leftJoin(
              `(SELECT COALESCE(COUNT(*), 0) as "follower_count", "followerId" FROM "users_followers" WHERE "type" = '${FollowType.PROFILE}' GROUP BY "followerId")`,
              'follower',
              `"follower"."followerId" = "data"."userId"`,
            )

            results.condition.addOrderBy(`"follower"."follower_count"`, 'ASC')
            break
          case Conditions.MVMNT_FOLLOWERS_DESC:
            results.condition.leftJoin(
              `(SELECT COALESCE(COUNT(*), 0) as "follower_count", "followerId" FROM "users_followers" WHERE "type" = '${FollowType.PROFILE}' GROUP BY "followerId")`,
              'follower',
              `"follower"."followerId" = "data"."userId"`,
            )

            results.condition.addOrderBy(`"follower"."follower_count"`, 'DESC')
            break
          // ToDo dynamic SNS follower sort
        }
      default:
        break
    }
  }

  results.condition.select([
    `data.id deal_id`,
    `data.name deal_name`,
    `data.status deal_status`,
    `data.start_date deal_start_date`,
    `data.starting_price deal_starting_price`,
    `data.end_date deal_end_date`,
    'user.id as "user_id"',
    'user.username user_username',
    `data.deal_type deal_deal_type`,
    `data.donation_type deal_donation_type`,
    `data.donation_amount deal_donation_amount`,
    'user.display_name user_display_name',
    'user.account_type user_account_type',
    `${GetDealFirstImageQuery('"data"."deal_type"', '"data"."id"')}`,
    `(SELECT
      "images"."url"
    FROM
      "images"
    WHERE "images"."id" = "profile"."profileImagesId" LIMIT 1) as "user_profile_image"`,
    `(${GetCurrentBidQuery(`data`)}) as "current_bid"`,
    `(SELECT
      MIN("deal_variants"."price")
    FROM  "deal_variants"
      WHERE "deal_variants"."dealId" = "data"."id") as "lowest_price"`,
    `(${GetTotalBidsQuery(`data`)}) as "total_bids"`,
    `(SELECT
      COUNT("deal_raffle_prizes"."id")
      FROM
        "deal_raffle_prizes"
        LEFT JOIN "deal_raffles"
          ON "deal_raffles"."id" = "deal_raffle_prizes"."rafflesId"
          WHERE "deal_raffles"."dealId" = "data"."id") as "total_prizes"`,
    `${GetDealQuantityQuery('"data"."id" = "deals"."id"')} AS "total_remaining_quantity"`,
    `${GetDonationAmountQuery(`data`)} as "final_donation_amount"`,
  ])

  results.condition.andWhere('"data"."status" IN (:...deal_status)', {
    deal_status: [DealStatus.ON_DEAL, DealStatus.ENDED],
  })

  return results
}
