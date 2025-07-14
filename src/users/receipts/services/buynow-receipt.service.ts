import { Not } from 'typeorm'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { AccountStatus } from '@app/src/users/user/enums'
import { PAYMENT_STATUS } from '@app/src/users/payment/enums'
import { CartStatus } from '@app/src/users/deal/buynow/enums'

export default async function (cartId: string, userId: string, purchaseId: string): Promise<any> {
  try {
    await this.userService.documentExists({
      condition: [
        {
          where: {
            id: userId,
            account_status: AccountStatus.ENABLED,
          },
          select: {
            id: true,
          },
        },
      ],
      errorMessage: ErrorKey.USER_NOT_FOUND,
    })

    const purchase = await this.userDealPaymentRepository.findOne({
      where: {
        id: purchaseId,
        user: {
          id: userId,
        },
        cart: {
          id: cartId,
          status: Not(CartStatus.PENDING),
        },
        status: Not(PAYMENT_STATUS.INITIATED),
      },
      relations: [
        'items',
        'items.donation_project',
        'items.donation_project.user',
        'items.payment_currency',
        'items.donation_project.user.profile',
      ],
      select: {
        id: true,
        created: true,
        donation_amount: true,
        deal_type: true,
        gas_fees: true,
        transaction_hash: true,
        payment_currency: {
          id: true,
          name: true,
          logo_uri: true,
          chain_id: true,
          address: true,
        },
        items: {
          id: true,
          deal_amount: true,
          donation_amount: true,
          buyer_points: true,
          seller_points: true,
          gas_fees: true,
          donation_project: {
            id: true,
            name: true,
            status: true,
            user: {
              id: true,
              profile: {
                id: true,
                foundation_name: true,
                foundation_url: true,
                introduction: true,
              },
            },
          },
        },
      },
    })

    const cartItemBuilder: QueryBuilderDataInterface = new QueryBuilder({})
      .addFilter('cart', cartId)
      .addRelation('cart')
      .addRelation('cart.delivery_address')
      .useQuery(this.buynowService.buyNowCartItemRepository)
      .create()

    cartItemBuilder.condition.select([
      'data.id id',
      'data.total::float total',
      'data.quantity::int quantity',
      'data.gross_donations::float gross_donations',
      'data.net_donations::float net_donations',
      'data.delivery_date delivery_date',
      'data.delivery_time_slot delivery_time_slot',
      'data.shipping_price shipping_price',
      'data."shippingProfileId" shipping_profile',
      `(
        SELECT JSON_BUILD_OBJECT(
          'id', "delivery_address"."id",
          'state', "delivery_address"."state",
          'city', "delivery_address"."city",
          'street', "delivery_address"."street",
          'building', "delivery_address"."building",
          'phone_number', "delivery_address"."phone_number"
        )
      ) as delivery_address`,
      `(
        SELECT
          JSON_BUILD_OBJECT(
            'id', "dv"."id",
            'price', "dv"."price",
            'original_price', "dv"."original_price",
            'return_eligibility', "dv"."return_eligibility",
            'deal_id', "d"."id",
            'deal_name', "d"."name",
            'seller_id', "d"."userId",
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
            ),
            'product_tag', (
              SELECT JSON_BUILD_OBJECT(
                'name', "pts"."name",
                'days_range', "pts"."days_range",
                'date_range', "pts"."date_range",
                'is_disable_delivery_tag', "pts"."is_disable_delivery_tag"
              )
              FROM "product_tag_settings" "pts"
              WHERE "pts"."id" = "dv"."productTagId"
              AND "pts"."status" = 'ENABLED'
            )
          )
        FROM "deal_variants" "dv"
        LEFT JOIN "deals" "d" ON "d"."id" = "dv"."dealId"
        WHERE "dv"."id" = "data"."variantId"::uuid
      ) AS "variant"`,
    ])

    const cart = await cartItemBuilder.condition.getRawMany()

    return {
      purchase,
      cart,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
