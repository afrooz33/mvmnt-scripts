import { Request } from 'express'
import { BadRequestException } from '@nestjs/common'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { decodeCookieService } from '@app/src/shared/services'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { CartStatus } from '@app/src/users/deal/buynow/enums'
import { GetApplicableShippingPrice } from '@app/src/users/deal/buynow/helpers'

export default async function (id: string, userId: string, req: Request): Promise<any> {
  try {
    const xGuestCartId: string = await decodeCookieService(req, 'xGuestCartId')

    const result: QueryBuilderDataInterface = new QueryBuilder({})
      .useQuery(this.buyNowCartRepository)
      .addFilter('id', id)
      .addFilter('status', CartStatus.PENDING)
      .addRelation(Query.ITEMS)
      .addRelation(`${Query.ITEMS}.${Query.DEAL}`)
      .addRelation(`${Query.DEAL}.${Query.USER}`)
      .addRelation(`${Query.ITEMS}.${Query.VARIANT}`)
      .create()

    if (userId) {
      result.condition.andWhere(`"data"."userId" = :userId`, { userId })
    } else if (xGuestCartId) {
      result.condition.andWhere(`"data"."guestCartId" = :xGuestCartId`, {
        xGuestCartId,
      })
    }

    result.condition.select([
      'data.id',
      'data.total as sub_total',
      'items.id',
      'items.total',
      'items.quantity',
      'variant.id',
      'variant.price',
      'variant.original_price',
      'variant.return_eligibility',
      'deal.id',
      'deal.name',
      'user.id',
    ])

    const cart = await result.condition.getOne()

    for (const item of cart.items) {
      const deal = item.deal
      const variant = item.variant

      // Fetch the weight of the item
      const itemWeight = await this.entityManager.query(`
        SELECT * 
        FROM "deal_option_values" "dov" 
        WHERE "dov"."optionId" = (
          SELECT "id" FROM "deal_options" WHERE "type" = 'WEIGHT'
        )
        AND "id" IN (
          SELECT "dealOptionValuesId" 
          FROM "deal_variants_option_values_deal_option_values" "dvov" 
          WHERE "dvov"."dealVariantsId" = '${variant.id}'
        );
      `)

      // Fetch applicable shipping prices
      const shipping_price = await this.shippingProfileService.applicableToDeal(
        deal.user.id,
        deal.id,
        variant.id,
        'price',
      )

      // Determine the correct shipping price based on conditions
      item.shipping_price = await GetApplicableShippingPrice(
        shipping_price.data,
        itemWeight,
        Number.parseFloat(item.variant.price),
        Number.parseInt(item.quantity),
      )
    }

    if (!cart) {
      throw new BadRequestException(ErrorKey.INVALID_CART)
    }

    return cart
  } catch (error) {
    return HandleErrors(error)
  }
}
