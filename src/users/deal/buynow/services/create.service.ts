import { DateTime } from 'luxon'
import { In, Not } from 'typeorm'
import { v4 as uuidv4 } from 'uuid'
import { Request, Response } from 'express'
import { BadRequestException, PreconditionFailedException } from '@nestjs/common'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import DonationHelper from '@app/src/shared/helpers/Donation.helper'
import { decodeCookieService, setCookieService } from '@app/src/shared/services'
import { CalculateDiscount } from '@app/src/shared/helpers/CalculateDiscount.helper'
import { AccountStatus } from '@app/src/users/user/enums'
import { CouponStatus } from '@app/src/admin/coupons/enums'
import { CartStatus } from '@app/src/users/deal/buynow/enums'
import { CreateCartDto } from '@app/src/users/deal/buynow/dto'
import { WishlistStatus } from '@app/src/users/wishlist/enums'
import { UserAddressStatus } from '@app/src/users/address/enums'
import { DealStatus, DonationType } from '@app/src/users/deal/enums'
import { BuynowCartEntity } from '@app/src/users/deal/buynow/entities/cart.entity'
import { BuynowCartItemEntity } from '@app/src/users/deal/buynow/entities/cart-item.entity'

export default async function (
  payload: CreateCartDto,
  req: Request,
  res: Response,
  userId?: string,
): Promise<any> {
  const queryRunner = this.buyNowCartRepository.manager.connection.createQueryRunner()

  await queryRunner.connect()
  await queryRunner.startTransaction()

  try {
    let user = null
    let delivery_address = null
    let xGuestCartId = await decodeCookieService(req, 'xGuestCartId')

    if (!xGuestCartId && !userId) {
      xGuestCartId = uuidv4()

      await setCookieService(res, xGuestCartId, 'xGuestCartId')
    }

    const deal = await this.dealService.findOne({
      where: {
        id: payload.deal,
        status: DealStatus.ON_DEAL,
      },
      relations: [Query.USER],
      select: ['id', 'name', 'user.id', 'donation_type', 'donation_amount', 'deal_type'],
    })

    if (!deal) {
      throw new BadRequestException(ErrorKey.DEAL_NOT_FOUND)
    }

    const variant = await this.dealService.dealVariantRepository.findOne({
      where: {
        id: payload.variant,
        deal: {
          id: payload.deal,
        },
      },
    })

    if (!variant) {
      throw new BadRequestException(ErrorKey.INVALID_VARIANT)
    }

    const isInventoryAvailable = await this.inventoryService.checkInventoryAvailability(
      payload.variant,
      payload.quantity,
    )

    if (!isInventoryAvailable) {
      throw new BadRequestException(ErrorKey.INSUFFICIENT_QUANTITY)
    }

    const cartConditions: any = {
      seller: {
        id: deal?.user?.id,
      },
      status: CartStatus.PENDING,
    }

    if (userId) {
      cartConditions['user'] = {
        id: userId,
      }

      user = await this.userService.findOne({
        where: {
          id: userId,
          account_status: AccountStatus.ENABLED,
        },
        select: ['id', 'username', 'display_name', 'account_type'],
      })

      if (!user) {
        throw new BadRequestException(ErrorKey.USER_NOT_FOUND)
      }

      delivery_address = await this.shippingProfileService.addressService.findOne({
        where: {
          profile: {
            user: {
              id: user.id,
            },
          },
          is_default: true,
          is_personal: false,
          status: Not(In([UserAddressStatus.DELETED, UserAddressStatus.SYSTEM_DEFAULT])),
        },
        select: ['id'],
      })
    } else {
      cartConditions['guestCartId'] = xGuestCartId
    }

    if (payload.wishlist) {
      cartConditions['wishlist'] = {
        id: payload.wishlist,
      }

      const wishlistVariant = await this.wishlistService.findOne({
        where: {
          id: payload.wishlist,
          status: WishlistStatus.PUBLIC,
          variants: {
            variant: {
              id: payload.variant,
            },
          },
        },
        relations: ['variants'],
        select: {
          id: true,
          variants: {
            id: true,
            needs: true,
          },
        },
      })

      if (!wishlistVariant) {
        throw new BadRequestException(ErrorKey.INVALID_WISHLIST_VARIANT)
      }

      const needs = wishlistVariant.variants[0]?.needs

      if (Number.parseInt(needs) > 0 && Number.parseInt(needs) < payload.quantity) {
        throw new PreconditionFailedException(`Wishlist needs only ${needs} quantity`)
      }

      const totalQuantity = await this.buyNowCartRepository
        .createQueryBuilder('cart')
        .select('COALESCE(SUM(cart_item.quantity), 0)::int', 'has')
        .innerJoin('cart.items', 'cart_item')
        .innerJoin('cart_item.variant', 'variant')
        .where('cart."wishlistId" = :wishlistId', { wishlistId: payload.wishlist })
        .andWhere('variant.id = :variantId', { variantId: payload.variant })
        .andWhere('cart.status NOT IN (:...statuses)', {
          statuses: [CartStatus.PENDING, CartStatus.CANCELLED],
        })
        .getRawOne()

      if (totalQuantity && totalQuantity.has > 0 && totalQuantity.has >= payload.quantity) {
        throw new PreconditionFailedException(`Wishlist already has ${totalQuantity.has} quantity`)
      }
    }

    const preCart = await queryRunner.manager.findOne(BuynowCartEntity, {
      where: cartConditions,
      select: ['id'],
    })

    let cart = null

    if (preCart) {
      await queryRunner.manager.query(
        `SELECT 1 FROM user_deal_buynow_cart WHERE id = $1 FOR UPDATE`,
        [preCart.id],
      )

      cart = await queryRunner.manager.findOne(BuynowCartEntity, {
        where: { id: preCart.id },
        relations: [
          Query.USER,
          Query.ITEMS,
          Query.COUPON,
          `${Query.ITEMS}.${Query.DEAL}`,
          `${Query.ITEMS}.${Query.VARIANT}`,
        ],
      })
    }

    if (!cart) {
      const guestCartUser = await this.entityManager.query(
        `SELECT "userId" FROM "user_deal_buynow_cart" WHERE "guestCartId" = '${xGuestCartId}' AND "userId" IS NOT NULL;`,
      )

      cart = await queryRunner.manager.save(BuynowCartEntity, {
        seller: {
          id: deal?.user?.id,
        },
        delivery_address,
        status: CartStatus.PENDING,
        items: [],
        guestCartId: xGuestCartId,
        coupon: null,
        wishlist: payload.wishlist ? { id: payload.wishlist } : null,
        total: 0,
        gross_donations: 0,
        net_donations: 0,
        user: userId
          ? { id: userId }
          : guestCartUser.length
            ? { id: guestCartUser[0]['userId'] }
            : null,
        expires_at: DateTime.now().plus({ days: 15 }).toJSDate(),
      })
    }

    const discountCode = await decodeCookieService(req, 'x-discount-code')

    let coupon = cart.coupon

    if (discountCode && userId && !coupon) {
      const appliedCoupon = await this.entityManager.findOne('coupons', {
        where: {
          code: discountCode,
          status: CouponStatus.ENABLED,
          user: Not(userId),
        },
        relations: [
          Query.COUPON_TARGET_USER,
          Query.COUPON_TARGET_DEAL,
          Query.USER_SEARCH_CONDITIONS,
          Query.COUPON_TARGET_DEAL_VARIANT,
        ],
      })

      coupon = await this.checkCoupon(appliedCoupon, userId, payload)
    }

    const quantity = Math.floor(payload.quantity)
    const itemPrice = quantity * variant.price

    const existingCartItem = cart.items.find(
      (item) => item.deal.id === payload.deal && item.variant.id === payload.variant,
    )

    let donation = {
      amount: 0,
      net_amount: 0,
      system_fee: 0,
    }

    const systemFee = await this.systemFeeService.findByUserOrDefault(userId)

    const appliedFixedPerOrderDeals = new Set<string>(
      cart.items
        .filter((item) => item.deal.donation_type === DonationType.FIXED_PER_ORDER)
        .map((item) => item.deal.id),
    )

    let savedOrUpdatedItem: BuynowCartItemEntity

    if (existingCartItem) {
      const isFixedPerOrderApplied = appliedFixedPerOrderDeals.has(existingCartItem.deal.id)

      existingCartItem.quantity = Number.parseInt(existingCartItem.quantity) + quantity
      existingCartItem.total = Number.parseInt(existingCartItem.quantity) * variant.price

      donation = await DonationHelper(
        existingCartItem.deal,
        systemFee,
        user,
        existingCartItem.total,
        existingCartItem.quantity,
        isFixedPerOrderApplied,
      )

      if (
        existingCartItem.deal.donation_type === DonationType.FIXED_PER_ORDER &&
        !isFixedPerOrderApplied
      ) {
        appliedFixedPerOrderDeals.add(existingCartItem.deal.id)
      }

      existingCartItem.system_fee = donation.system_fee
      existingCartItem.gross_donations = donation.amount
      existingCartItem.net_donations = donation.net_amount
      savedOrUpdatedItem = await queryRunner.manager.save(BuynowCartItemEntity, existingCartItem)
    } else {
      const isFixedPerOrderApplied = appliedFixedPerOrderDeals.has(deal.id)

      donation = await DonationHelper(
        deal,
        systemFee,
        user,
        itemPrice,
        quantity,
        isFixedPerOrderApplied,
      )

      if (deal.donation_type === DonationType.FIXED_PER_ORDER && !isFixedPerOrderApplied) {
        appliedFixedPerOrderDeals.add(deal.id)
      }

      const newItem = queryRunner.manager.create(BuynowCartItemEntity, {
        cart: { id: cart.id },
        deal: { id: payload.deal },
        variant: { id: payload.variant },
        quantity,
        total: itemPrice,
        system_fee: donation.system_fee,
        gross_donations: donation.amount,
        net_donations: donation.net_amount,
      })
      savedOrUpdatedItem = await queryRunner.manager.save(BuynowCartItemEntity, newItem)
      cart.items.push(savedOrUpdatedItem)
    }

    cart.coupon = coupon
    cart.delivery_address = delivery_address

    if (cart.coupon) {
      cart.total_discount = await CalculateDiscount(cart.coupon, {
        ...cart,
        is_buynow: true,
      })
    }

    cart.total = cart.items.reduce((sum, item) => sum + Number(item.total), 0)

    cart.gross_donations = cart.items.reduce((sum, item) => {
      return sum + Number(item.gross_donations)
    }, 0)

    cart.net_donations = cart.items.reduce((sum, item) => sum + Number(item.net_donations), 0)

    await queryRunner.manager.save(BuynowCartEntity, cart)

    await queryRunner.commitTransaction()

    return res.json({
      success: true,
      message: 'Cart updated successfully',
      data: {
        id: cart.id,
      },
    })
  } catch (error) {
    await queryRunner.rollbackTransaction()
    return HandleErrors(error)
  } finally {
    await queryRunner.release()
  }
}
