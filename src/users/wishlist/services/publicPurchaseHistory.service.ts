import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { CartStatus } from '@app/src/users/deal/buynow/enums'
import { WishlistStatus } from '@app/src/users/wishlist/enums'
import { PublicPurchaseHistoryQueryDto } from '@app/src/users/wishlist/dto'

export default async function (query: PublicPurchaseHistoryQueryDto) {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.cartRepository)
      .addFilter('user', query.buyer)
      .addRelation('seller')
      .addRelation('seller.profile')
      .addRelation('profile.profile_images')
      .addRelation('user')
      .addRelation('user.profile')
      .addRelation('user.profile.profile_images')
      .create()

    results.condition.andWhere(`"data"."status" NOT IN (:...cartStatus)`, {
      cartStatus: [CartStatus.PENDING, CartStatus.CANCELLED],
    })

    results.condition.andWhere(
      `"data"."wishlistId" IS NOT NULL
        AND "data"."wishlistId" IN (
          SELECT
            "id"
          FROM
            "wishlists"
          WHERE
            "wishlists"."userId" = :userId
              AND "wishlists"."status" = :wishlistStatus
        )`,
      {
        userId: query.seller,
        wishlistStatus: WishlistStatus.PUBLIC,
      },
    )

    results.condition.select([
      'data.id id',
      'data.total total',
      'data.purchase_date purchase_date',
      'data.gross_donations gross_donations',
      'data.net_donations net_donations',
      `JSON_BUILD_OBJECT(
        'id', "seller"."id",
        'display_name', "seller"."display_name",
        'username', "seller"."username",
        'account_type', "seller"."account_type",
        'account_status', "seller"."account_status",
        'is_verified', "seller"."is_verified",
        'profile_image', "profile_images"."url"
      ) AS seller`,
      `(
        SELECT json_agg(
          json_build_object(
            'id', "i"."id",
            'total', "i"."total",
            'quantity', "i"."quantity",
            'gross_donations', "i"."gross_donations",
            'net_donations', "i"."net_donations",
            'deal', json_build_object(
              'id', "d"."id",
              'name', "d"."name",
              'deal_type', "d"."deal_type",
              'donation_project', (
                SELECT 
                  JSON_BUILD_OBJECT(
                    'id',  "donation_project"."id", 
                    'name', "donation_project"."name", 
                    'status', "donation_project"."status",
                    'nonprofit_id',  "nu"."id", 
                    'profile',  JSON_BUILD_OBJECT(
                      'id', "np"."id", 
                      'foundation_name', "np"."foundation_name",
                      'foundation_url', "np"."foundation_url",
                      'profile_image', JSON_BUILD_OBJECT('id', "i"."id", 'url', "i"."url")
                    )
                  ) 
                FROM 
                  "donation_projects" "donation_project"
                  INNER JOIN "nonprofit_users" "nu" ON "donation_project"."userId" = "nu"."id"
                  LEFT JOIN "nonprofit_profiles" "np" ON "np"."userId" = "nu"."id" 
                  LEFT JOIN "images" "i" ON "i"."id" = "np"."profileImageId" 
                WHERE 
                  "d"."donationProjectId" = "donation_project"."id" 
                LIMIT 
                  1
              )
            ),
            'variant', json_build_object(
              'id', "v"."id",
              'price', "v"."price",
              'original_price', "v"."original_price",
              'return_eligibility', "v"."return_eligibility",
              'option_values', (
                SELECT json_agg(
                  json_build_object(
                    'id', "ov"."id",
                    'value', "ov"."value",
                    'label_name', "ov"."label_name",
                    'option', json_build_object(
                      'id', "o"."id",
                      'type', "o"."type"
                    )
                  )
                )
                FROM "deal_option_values" "ov"
                JOIN "deal_variants_option_values_deal_option_values" "vov" ON "ov"."id" = "vov"."dealOptionValuesId"
                JOIN "deal_options" "o" ON "ov"."optionId" = "o"."id"
                WHERE "vov"."dealVariantsId" = "v"."id"
              ),
              'images', (
                SELECT json_agg(
                  json_build_object(
                    'id', "img"."id",
                    'url', "img"."url"
                  )
                )
                FROM "deal_variants_images_images" "vi"
                LEFT JOIN "images" "img" ON "img"."id" = "vi"."imagesId"
                WHERE "vi"."dealVariantsId" = "v"."id"
              )
            )
          )
        )
        FROM "user_deal_buynow_cart_items" "i"
        JOIN "deals" d ON "i"."dealId" = "d"."id"
        JOIN "users" s ON "d"."userId" = "s"."id"
        JOIN "deal_variants" "v" ON "i"."variantId" = "v"."id"
        WHERE "i"."cartId" = "data"."id"
      ) AS "items"`,
    ])

    return await this.rawPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
