import { In } from 'typeorm'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { AccountStatus } from '@app/src/users/user/enums'
import { DealStatus, DealType } from '@app/src/users/deal/enums'

export default async function (id: string, userId: string): Promise<SuccessRO> {
  try {
    const user = await this.userService.documentExists({
      condition: [
        {
          where: {
            id: userId,
            account_status: AccountStatus.ENABLED,
          },
          select: ['id', 'account_status', 'account_type'],
        },
      ],
      errorMessage: JSON.stringify({
        key: ErrorKey.USER_NOT_FOUND,
        args: { id: userId },
      }),
    })

    const deal = await this.documentExists({
      condition: [
        {
          where: {
            id,
            user: {
              id: user.id,
            },
            status: In([DealStatus.DRAFT]),
          },
          relations: [
            Query.USER,
            Query.BRAND,
            Query.IMAGES,
            Query.CATEGORY,
            Query.SHIPPING_FEE,
            Query.SHIPPING_METHOD,
            Query.DONATION_PROJECT,
            Query.DONATION_NONPROFIT,
          ],
        },
      ],
      errorMessage: JSON.stringify({
        key: ErrorKey.DEAL_NOT_FOUND,
        args: { id },
      }),
    })

    if (deal.deal_type === DealType.BUYNOW) {
      const buynowDeal = await this.dealRepository.findOne({
        where: {
          id: deal.id,
        },
        relations: [Query.OPTIONS, Query.VARIANTS, Query.OPTION_VALUES, Query.VARIANTS_IMAGES],
      })

      deal.options = buynowDeal.options
      deal.variants = buynowDeal.variants

      deal.variants.forEach((variant) => {
        variant.images = variant.images.map((image) => {
          return { ...image, id: undefined }
        })
      })

      deal.variants.forEach((variant) => {
        variant.id = undefined

        variant.option_values.forEach((option_value) => {
          option_value.id = undefined
        })
      })

      if (deal.images) {
        deal.images.forEach((image) => {
          image.id = undefined
        })
      }
    }

    if (deal.deal_type === DealType.RAFFLE) {
      const raffleDeal = await this.dealRepository.findOne({
        where: {
          id: deal.id,
        },
        relations: [Query.RAFFLES, Query.RAFFLE_PRIZES, `${Query.RAFFLE_PRIZES}.${Query.IMAGES}`],
      })

      deal.raffles = raffleDeal.raffles

      deal.images = deal.images.map((image) => {
        return { ...image, id: undefined }
      })

      deal.raffles.id = undefined

      deal.raffles.raffle_prizes.map((prize) => {
        prize.id = undefined

        prize.images = prize.images.map((image) => {
          return { ...image, id: undefined }
        })
      })
    }

    if (deal.shipping_fee) {
      deal.shipping_fee = deal.shipping_fee.map((fee) => {
        return { ...fee, id: undefined }
      })
    }

    const duplicated = await this.updateOne({
      ...deal,
      id: undefined,
      created: new Date(),
      updated: new Date(),
      status: DealStatus.DRAFT,
    })

    return {
      success: true,
      message: 'Deal duplicated successfully',
      data: duplicated.toResponseObject(),
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
