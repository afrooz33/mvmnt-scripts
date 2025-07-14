import { In } from 'typeorm'
import { Response, Request } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { BadRequestException, UnprocessableEntityException } from '@nestjs/common'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import DonationHelper from '@app/src/shared/helpers/Donation.helper'
import { decodeCookieService, setCookieService } from '@app/src/shared/services'
import { AccountStatus } from '@app/src/users/user/enums'
import { CartStatus } from '@app/src/users/deal/buynow/enums'
import { DealStatus, DonationType } from '@app/src/users/deal/enums'
import { BuynowCartEntity } from '@app/src/users/deal/buynow/entities/cart.entity'

export default async function updateCartQtyService(
  cartId: string,
  dealId: string,
  variantId: string,
  quantity: string,
  userId: string,
  req: Request,
  res: Response,
): Promise<unknown> {
  try {
    let user = null
    let xGuestCartId: string = await decodeCookieService(req, 'xGuestCartId')

    if (!xGuestCartId) {
      xGuestCartId = uuidv4()

      await setCookieService(res, xGuestCartId, 'xGuestCartId')
    }

    const cartCondition = {
      id: cartId,
      status: CartStatus.PENDING,
    }

    if (userId) {
      cartCondition['user'] = {
        id: userId,
        account_status: AccountStatus.ENABLED,
      }

      user = await this.userService.findOne({
        where: {
          id: userId,
          account_status: AccountStatus.ENABLED,
        },
        select: ['id', 'username', 'display_name', 'account_type'],
      })
    } else {
      cartCondition['guestCartId'] = xGuestCartId
    }

    const cart: BuynowCartEntity = await this.documentExists({
      condition: [
        {
          where: cartCondition,
          relations: [Query.COUPON],
        },
      ],
      errorMessage: ErrorKey.INVALID_CART,
    })

    const variantOption = await this.buyNowCartItemRepository.findOne({
      where: {
        deal: {
          id: dealId,
          status: In([DealStatus.ON_DEAL]),
        },
        variant: {
          id: variantId,
        },
        cart: {
          id: cart.id,
        },
      },
      relations: [Query.VARIANT, Query.CART],
    })

    if (!variantOption) {
      throw new UnprocessableEntityException(ErrorKey.INVALID_CART)
    }

    if (Number.parseInt(quantity) < 1) {
      const final_total = cart.total - variantOption.total

      await this.buyNowCartItemRepository.delete({ id: variantOption.id })

      const itemLeft = await this.buyNowCartItemRepository.count({
        where: {
          cart: {
            id: cart.id,
          },
        },
      })

      if (itemLeft <= 0) {
        await this.buyNowCartRepository.delete({ id: cart.id })
      } else {
        await this.updateOne({
          id: cart.id,
          total: final_total,
        })
      }

      return res.json({
        success: true,
        message: 'Item removed from cart',
      })
    }

    const deal = await this.dealService.findOne({
      where: {
        id: dealId,
        status: DealStatus.ON_DEAL,
      },
      relations: [Query.USER],
      select: ['id', 'donation_type', 'donation_amount', 'deal_type'],
    })

    const inventory = await this.dealService.getApplicableInventory(dealId, variantId, deal.user.id)

    if (inventory.quantity < Number.parseInt(quantity)) {
      throw new BadRequestException(ErrorKey.INSUFFICIENT_QUANTITY)
    }

    const systemFee = await this.systemFeeService.findByUserOrDefault(null)

    // Update option with new quantity and total
    variantOption.quantity = Number.parseInt(quantity)
    variantOption.total = Number.parseInt(quantity) * Number.parseFloat(variantOption.variant.price)

    // Calculate donation based on deal type
    if (deal.donation_type !== DonationType.FIXED_PER_ORDER) {
      const donation = await DonationHelper(
        deal,
        systemFee,
        user,
        variantOption.total,
        variantOption.quantity,
      )

      variantOption.system_fee = donation.system_fee
      variantOption.gross_donations = donation.amount
      variantOption.net_donations = donation.net_amount
    }

    // Save the updated cart item
    await this.buyNowCartItemRepository.save(variantOption)

    // Recalculate cart totals
    const updatedCart = await this.findOne({
      where: {
        id: cart.id,
      },
      relations: [Query.ITEMS],
    })

    await this.updateOne({
      id: cart.id,
      total: updatedCart.items.reduce((a, b) => Number(a) + Number(b.total), 0),
      gross_donations: updatedCart.items.reduce((a, b) => Number(a) + Number(b.gross_donations), 0),
      net_donations: updatedCart.items.reduce((a, b) => Number(a) + Number(b.net_donations), 0),
    })

    return res.json({
      success: true,
      data: updatedCart,
      message: 'Cart updated successfully',
    })
  } catch (error) {
    return HandleErrors(error)
  }
}
