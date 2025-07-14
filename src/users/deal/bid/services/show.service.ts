import { Query } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { QueryDto } from '@app/src/users/deal/bid/dto'
import { BidStatus } from '@app/src/users/deal/bid/enums'

export default async function (query: QueryDto, userId: string) {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.bidRepository)
      .addFilter('user', userId)
      .addRelation(Query.DEAL)
      .addRelation(`${Query.DEAL}.${Query.USER}`)
      .addRelation(`${Query.USER}.${Query.PROFILE}`)
      .create()

    results.condition.select([
      'data.id id',
      'data.bid_amount bid_amount',
      'data.status status',
      'data.quantity quantity',
      'data.created created',
      'data.decline_date decline_date',
      'data.reject_date reject_date',
      `json_build_object(
        'id', "deal"."id",
        'name', "deal"."name",
        'description', "deal"."description",
        'start_date', "deal"."start_date",
        'end_date', "deal"."end_date",
        'status', "deal"."status",
        'deal_image', (
          SELECT
            "images"."url"
          FROM
            "deals_images_images" "deal_images"
          LEFT JOIN "images" ON "images"."id" = "deal_images"."imagesId"
          WHERE "deal"."id" = "deal_images"."dealsId" LIMIT 1
        )
      ) deal`,
      `json_build_object(
        'id', "user"."id",
        'username', "user"."username",
        'display_name', "user"."display_name",
        'account_type', "user"."account_type",
        'is_verified', "user"."is_verified",
        'profile_images', (
          SELECT "images"."url" 
          FROM "images" 
          WHERE "images"."id" = (
            SELECT "user_profiles"."profileImagesId" 
            FROM "user_profiles"
            WHERE "user_profiles"."userId" = "user"."id"
          )
        )
      ) AS seller`,
      `(SELECT
          json_build_object(
            'id', "user"."id",
            'username', "user"."username",
            'display_name', "user"."display_name",
            'account_type', "user"."account_type",
            'is_verified', "user"."is_verified",
            'profile_images', "image"."url"
          )
        FROM
          "user_deal_bids" "bid"
        LEFT JOIN "deals" "deal" ON "deal"."id" = "data"."dealId"
        LEFT JOIN "users" "user" ON "user"."id" = "bid"."userId"
        LEFT JOIN "user_profiles" "profile" ON "profile"."userId" = "user"."id"
        LEFT JOIN "images" "image" ON "image"."id" = "profile"."profileImagesId"
        WHERE "bid"."status" = '${BidStatus.AWARDED}' AND "data"."dealId" = "deal"."id" LIMIT 1) AS "winner"`,
      `(SELECT
          json_build_object(
            'id', "user"."id",
            'username', "user"."username",
            'display_name', "user"."display_name",
            'account_type', "user"."account_type",
            'is_verified', "user"."is_verified",
            'profile_images', "image"."url"
          )
        FROM
          "user_deal_bids" "bid"
        LEFT JOIN "deals" "deal" ON "deal"."id" = "data"."dealId"
        LEFT JOIN "users" "user" ON "user"."id" = "bid"."userId"
        LEFT JOIN "user_profiles" "profile" ON "profile"."userId" = "user"."id"
        LEFT JOIN "images" "image" ON "image"."id" = "profile"."profileImagesId"
        WHERE "data"."dealId" = "deal"."id" AND "bid"."status" NOT IN (
          '${BidStatus.CANCELLED}',
          '${BidStatus.REJECTED}',
          '${BidStatus.DECLINED}'
        )
        ORDER BY "bid"."bid_amount" DESC LIMIT 1) AS "highest_bidder"`,
    ])

    return await this.rawPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
