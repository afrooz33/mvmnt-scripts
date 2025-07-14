import { PaginateRO } from '@app/src/shared/dto'
import { Query } from '@app/src/shared/enums'
import { GetWishlistHasQuantityQuery } from '@app/src/shared/sql'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { QueryItemDto } from '@app/src/users/wishlist/dto'
import { WishlistStatus } from '@app/src/users/wishlist/enums'
import { DealRatingStatus } from '@app/src/users/deal/review/enums'

export default async function (
  id: string,
  userId: string,
  query: QueryItemDto,
): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .addFilter('wishlist', id)
      .addRelation(Query.WISHLIST)
      .useQuery(this.wishlistVariantRepository)
      .create()

    results.condition.andWhere('"wishlist"."userId" = :user', {
      user: userId,
    })

    results.condition.andWhere('"wishlist"."status" != :wishlistStatus', {
      wishlistStatus: WishlistStatus.DELETED,
    })

    if (query?.priority) {
      results.condition.andWhere(`"data"."priority" = :priority`, {
        priority: query.priority,
      })
    }

    results.condition.select([
      'data.id id',
      'data.needs needs',
      'data.comment comment',
      'data.priority priority',
      'data.sorting_order sorting_order',
      `(${GetWishlistHasQuantityQuery(id, '"data"."variantId"')}) as "has"`,
      `(
        SELECT
          JSON_BUILD_OBJECT(
            'id', "dv"."id",
            'price', "dv"."price",
            'quantity', 0,
            'deal_id', "d"."id",
            'deal_type', "d"."deal_type",
            'deal_name', "d"."name",
            'average_rating', (
              SELECT COALESCE(CAST(AVG("udr"."rating") AS DECIMAL(10, 2)), 0)
              FROM "user_deal_review" "udr"
              WHERE "udr"."dealId" = "d"."id" AND "udr"."status" = '${DealRatingStatus.ENABLED}'
            ),
            'total_rating_count', (
              SELECT COALESCE(COUNT("udr"."rating"), 0)
              FROM "user_deal_review" "udr"
              WHERE "udr"."dealId" = "d"."id" AND "udr"."status" = '${DealRatingStatus.ENABLED}'
            ),
            'deal_description', "d"."description",
            'option_values', (
              SELECT COALESCE(JSON_AGG(JSON_BUILD_OBJECT(
                'id', "dov"."id",
                'value', "dov"."value",
                'label_name', "dov"."label_name",
                'option', JSON_BUILD_OBJECT(
                  'id', "do"."id",
                  'type', "do"."type"
                )
              )), '[]')
              FROM "deal_option_values" "dov"
              JOIN "deal_variants_option_values_deal_option_values" "dvov" ON "dvov"."dealOptionValuesId" = "dov"."id"
              LEFT JOIN "deal_options" "do" ON "do"."id" = "dov"."optionId"
              WHERE "dvov"."dealVariantsId" = "dv"."id"
            ),
            'images', (
              SELECT COALESCE(JSON_AGG(JSON_BUILD_OBJECT('url', "i"."url")), '[]')
              FROM "deal_variants_images_images" "dvii"
              LEFT JOIN "images" "i" ON "i"."id" = "dvii"."imagesId"
              WHERE "dvii"."dealVariantsId" = "dv"."id"
            )
          )
        FROM "deal_variants" "dv"
        LEFT JOIN "deals" "d" ON "d"."id" = "dv"."dealId"
        WHERE "dv"."id" = "data"."variantId"
      ) AS "variant"`,
    ])

    let condition = ''

    if (query?.item_name) {
      condition = `AND LOWER("d"."name") LIKE LOWER('${query.item_name}%')`
    }

    if (query?.price?.start) {
      condition += ` AND "dv"."price" >= ${query.price.start}`
    }

    if (query?.price?.end) {
      condition += ` AND "dv"."price" <= ${query.price.end}`
    }

    if (condition) {
      results.condition.andWhere(`"data"."id" IN (
        SELECT
          "wv"."id"
        FROM "wishlists" "w"
        JOIN "wishlist_variants" "wv" ON "wv"."wishlistId" = "w"."id"
        JOIN "deal_variants" "dv" ON "dv"."id" = "wv"."variantId"
        JOIN "deals" "d" ON "d"."id" = "dv"."dealId"
        WHERE "d"."id" = "dv"."dealId" AND "w"."userId" = '${userId}' AND "w"."id" = '${id}' ${condition}
      )`)
    }

    results.condition.andWhere('"wishlist"."id" = :wishlistId', { wishlistId: id })

    results.condition.orderBy('data.sorting_order', 'ASC')

    return await this.rawPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
