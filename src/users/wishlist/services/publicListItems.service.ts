import { PaginateRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { WishlistStatus } from '@app/src/users/wishlist/enums'
import { PublicListItemQueryDto } from '@app/src/users/wishlist/dto'

export default async function (query: PublicListItemQueryDto, userId: string): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.dealVariantRepository)
      .create()

    results.condition.innerJoin(
      'wishlist_variants',
      'wishlist_variants',
      '"wishlist_variants"."variantId" = "data"."id"',
    )

    results.condition.innerJoin(
      'wishlists',
      'wishlists',
      '"wishlist_variants"."wishlistId" = "wishlists"."id"',
    )

    results.condition.where('"wishlists"."status" = :status', {
      status: WishlistStatus.PUBLIC,
    })

    if (query?.keyword) {
      results.condition.andWhere(
        `(
          "data"."id" IN (SELECT
            "variants"."id"
          FROM
            "deals" "deals"
          LEFT JOIN "deal_variants" "variants" ON "variants"."dealId" = "deals"."id"
          WHERE LOWER("deals"."name") ILIKE :search)
          OR
          LOWER("wishlists"."title") ILIKE :search
          OR
          LOWER("wishlists"."description") ILIKE :search
        )`,
        { search: `%${query.keyword}%` },
      )
    }

    if (userId) {
      results.condition
        .innerJoin('users', 'users', '"wishlists"."userId" = "users"."id"')
        .andWhere('"users"."nonprofitId" = :nonprofitId', { nonprofitId: userId })
    } else {
      results.condition
        .innerJoin('users', 'users', '"wishlists"."userId" = "users"."id"')
        .andWhere('"users"."nonprofitId" IS NOT NULL')
    }

    if (query?.wishlists) {
      results.condition.andWhere('"wishlists"."id" IN (:...wishlistFilter)', {
        wishlistFilter: query.wishlists,
      })
    }

    if (query?.nonprofits) {
      results.condition.andWhere('"users"."nonprofitId" IN (:...nonprofits)', {
        nonprofits: query.nonprofits,
      })
    }

    if (query?.tags) {
      results.condition.andWhere('"wishlists"."tagId" IN (:...tags)', {
        tags: query.tags,
      })
    }

    results.condition.select([
      '"data"."id"',
      '"data"."price"',
      `(SELECT "id" FROM "deals" WHERE "deals"."id" = "data"."dealId") AS "deal_id"`,
      `(SELECT "name" FROM "deals" WHERE "deals"."id" = "data"."dealId") AS "deal_name"`,
      `(
          SELECT
            COALESCE(JSON_AGG(JSON_BUILD_OBJECT('url', "i"."url")), '[]')
          FROM
            "deal_variants_images_images" "variant_images"
          LEFT JOIN "images" "i" ON "i"."id" = "variant_images"."imagesId"
          WHERE "variant_images"."dealVariantsId" = "data"."id"
        ) AS "images"`,
      `(
        SELECT
          COUNT(*)::int
        FROM
          "wishlist_variants"
        LEFT JOIN "wishlists" ON "wishlists"."id" = "wishlist_variants"."wishlistId"
        WHERE "wishlist_variants"."variantId" = "data"."id" AND "wishlists"."status" = '${WishlistStatus.PUBLIC}') AS "wishlists_count"`,
    ])

    results.condition.groupBy(['"data"."id"'])

    if (query?.price?.start) {
      results.condition.andWhere('"data"."price" >= :startPrice', {
        startPrice: query.price.start,
      })
    }

    if (query?.price?.end) {
      results.condition.andWhere('"data"."price" <= :endPrice', {
        endPrice: query.price.end,
      })
    }

    return await this.rawPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
