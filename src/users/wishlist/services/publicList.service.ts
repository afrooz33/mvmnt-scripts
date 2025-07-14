import { PaginateRO } from '@app/src/shared/dto'
import { Query } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { PublicListQueryDto } from '@app/src/users/wishlist/dto'
import { PurchaseDateFilter, WishlistStatus } from '@app/src/users/wishlist/enums'

export default async function (
  query: PublicListQueryDto,
  userId: string,
  isNonprofit: boolean = false,
): Promise<PaginateRO> {
  try {
    const items_count = `(
      SELECT
        COUNT(*)::int
      FROM
        "wishlist_variants"
      WHERE
        "wishlist_variants"."wishlistId" = "data"."id"
    )`

    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.wishlistRepository)
      .addFilter('status', WishlistStatus.PUBLIC)
      .addRelation(Query.IMAGE)
      .addRelation(Query.TAG)
      .create()

    if (!isNonprofit) {
      results.condition.andWhere('"data"."userId" = :userId', { userId })
    } else {
      results.condition
        .innerJoin('users', 'users', '"data"."userId" = "users"."id"')
        .andWhere('"users"."nonprofitId" = :nonprofitId', { nonprofitId: userId })
    }

    if (query?.deadline_filter) {
      switch (query.deadline_filter) {
        case PurchaseDateFilter.ENDED:
          results.condition.andWhere('"data"."purchase_deadline" < :date', {
            date: new Date(),
          })
          break
        case PurchaseDateFilter.NOT_ENDED:
          results.condition.andWhere('"data"."purchase_deadline" >= :date', {
            date: new Date(),
          })
          break
        default:
          break
      }
    }

    results.condition.select([
      '"data"."id" id',
      '"data"."title" title',
      '"data"."description" description',
      '"data"."display_setting" display_setting',
      '"data"."purchase_deadline" purchase_deadline',
      '"data"."created" created',
      '"image"."url" image',
      '"tag"."name" tag',
      `${items_count} items_count`,
      `(
        SELECT 
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', 
              "wv"."variantId",
              'image', 
              (
                SELECT 
                  "i"."url"
                FROM 
                  deal_variants_images_images "dvii"
                  JOIN "images" "i" ON "i"."id" = "dvii"."imagesId" 
                WHERE 
                  "dvii"."dealVariantsId" = "wv"."variantId" 
                ORDER BY 
                  RANDOM()
                LIMIT 
                  1
              )
            )
          ) 
        FROM 
          (
            SELECT 
              wv."variantId" 
            FROM 
              wishlist_variants wv 
            WHERE 
              wv."wishlistId" = "data"."id"
            ORDER BY 
              RANDOM()
            LIMIT 
              5
          ) wv
      ) AS "items"`,
    ])

    results.condition.andWhere(`${items_count} > 0`)

    return await this.rawPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
