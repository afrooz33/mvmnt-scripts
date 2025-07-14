import { Request } from 'express'
import { NotFoundException } from '@nestjs/common'
import { PaginateRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { QueryDto } from '@app/src/users/deal/buynow/dto'
import { decodeCookieService } from '@app/src/shared/services'

export default async function (
  query: QueryDto,
  req: Request,
  userId?: string,
): Promise<PaginateRO> {
  try {
    const xGuestCartId: string = await decodeCookieService(req, 'xGuestCartId')

    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.buyNowCartRepository)
      .create()

    if (userId) {
      results.condition.andWhere(`"data"."userId" = :userId`, { userId })
    } else if (xGuestCartId) {
      results.condition.andWhere(`"data"."guestCartId" = :xGuestCartId`, {
        xGuestCartId,
      })
    } else {
      throw new NotFoundException(ErrorKey.INVALID_CART)
    }

    results.condition.select([
      'data.id as id',
      'data.total as total',
      'data.status as status',
      'data.created as created',
      `CASE WHEN "data"."wishlistId" IS NOT NULL THEN (
        SELECT json_build_object(
          'id', "w"."id",
          'title', "w"."title",
          'user', json_build_object(
            'id', "wu"."id",
            'username', "wu"."username",
            'display_name', "wu"."display_name",
            'account_type', "wu"."account_type",
            'profile', (
              SELECT json_build_object(
                'id', "wp"."id",
                'profile_image', json_build_object(
                  'id', "wpi"."id",
                  'url', "wpi"."url"
                )
              )
              FROM "user_profiles" "wp"
              LEFT JOIN "images" "wpi" ON "wp"."profileImagesId" = "wpi"."id"
              WHERE "wu"."id" = "wp"."userId"
            ),
            'nonprofit', (
              SELECT json_build_object(
                'id', "nu"."id",
                'profile', json_build_object(
                  'id', "np"."id",
                  'first_name', "np"."first_name",
                  'last_name', "np"."last_name",
                  'foundation_name', "np"."foundation_name",
                  'profile_image', json_build_object(
                    'id', "wui"."id",
                    'url', "wui"."url"
                  )
                )
              )
              FROM "nonprofit_users" "nu"
              JOIN "nonprofit_profiles" "np" ON "nu"."id" = "np"."userId"
              LEFT JOIN "images" "wui" ON np."profileImageId" = "wui"."id"
              WHERE "wu"."nonprofitId" = "nu"."id"
            )  
          )
        )
        FROM "wishlists" "w"
        JOIN "users" "wu" ON "w"."userId" = "wu"."id"
        WHERE "w"."id" = "data"."wishlistId"
      ) ELSE null END AS "wishlist"`,
      `(
        SELECT json_agg(
          json_build_object(
            'id', "i"."id",
            'total', "i"."total",
            'quantity', "i"."quantity",
            'deal', json_build_object(
              'id', "d"."id",
              'name', "d"."name",
              'seller', json_build_object(
                'id', "s"."id",
                'username', "s"."username",
                'display_name', "s"."display_name",
                'account_type', "s"."account_type",
                'profile', ( 
                  SELECT json_build_object(
                    'id', "sp"."id",
                    'profile_image', json_build_object(
                      'id', "spi"."id",
                      'url', "spi"."url"
                    )
                  )
                  FROM "user_profiles" "sp"
                  LEFT JOIN "images" "spi" ON "sp"."profileImagesId" = "spi"."id"
                  WHERE "s"."id" = "sp"."userId"
                )  
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
