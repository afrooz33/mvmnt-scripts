import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, EntityManager, IsNull } from 'typeorm'
import { OnEvent } from '@nestjs/event-emitter'
import { BuynowCartEntity } from '@app/src/users/deal/buynow/entities/cart.entity'
import { CalculateDiscount } from '@app/src/shared/helpers/CalculateDiscount.helper'
import { BuynowCartItemEntity } from '@app/src/users/deal/buynow/entities/cart-item.entity'
import { SystemFeeService } from '@app/src/admin/system-fee/system-fee.service'
import { DealService } from '@app/src/users/deal/deal.service'
import { DonationType } from '@app/src/users/deal/enums'
import { CartStatus } from '@app/src/users/deal/buynow/enums'
import DonationHelper from '@app/src/shared/helpers/Donation.helper'
import { IEventEmitter } from '@app/src/shared/interfaces'

@Injectable()
export class MergeCartListener {
  constructor(
    @InjectRepository(BuynowCartEntity)
    private readonly buyNowCartRepository: Repository<BuynowCartEntity>,
    @InjectRepository(BuynowCartItemEntity)
    private readonly buyNowCartItemRepository: Repository<BuynowCartItemEntity>,
    private readonly entityManager: EntityManager,
    private readonly systemFeeService: SystemFeeService,
    private readonly dealService: DealService,
  ) {}

  @OnEvent('user.merge.cart')
  async handleMergeCart(payload: IEventEmitter): Promise<void> {
    try {
      const systemFee = await this.systemFeeService.findByUserOrDefault(payload.user.id)

      const guestCarts = await this.buyNowCartRepository.find({
        where: {
          guestCartId: payload.xGuestCartId,
          status: CartStatus.PENDING,
          user: IsNull(),
        },
        relations: ['items', 'seller', 'wishlist', 'items.variant', 'items.deal'],
      })

      for (const guestCart of guestCarts) {
        let userCart = await this.buyNowCartRepository.findOne({
          where: {
            user: { id: payload.user.id },
            seller: { id: guestCart.seller.id },
            wishlist: { id: guestCart.wishlist?.id },
            status: CartStatus.PENDING,
          },
          relations: ['items', 'items.variant', 'items.deal', 'coupon'],
        })

        if (!userCart) {
          // If no user cart exists, convert the guest cart to a user cart
          userCart = await this.buyNowCartRepository.save({
            ...guestCart,
            id: undefined,
            user: { id: payload.user.id },
            guestCartId: null,
          })

          // Update items to point to the new user cart
          for (const guestItem of guestCart.items) {
            const newItem = this.buyNowCartItemRepository.create({
              ...guestItem,
              cart: {
                id: userCart.id,
              },
            })

            await this.buyNowCartItemRepository.save(newItem)
          }
        } else {
          // Merge guest cart items into user cart
          for (const guestItem of guestCart.items) {
            const existingItem = userCart.items.find(
              (item) => item.variant.id === guestItem.variant.id,
            )

            if (existingItem) {
              // Update existing item
              existingItem.quantity =
                Math.floor(existingItem.quantity) + Math.floor(guestItem.quantity)
              existingItem.total = existingItem.quantity * existingItem.variant.price

              await this.buyNowCartItemRepository.save(existingItem)
            } else {
              // Add new item to user cart
              const newItem = await this.buyNowCartItemRepository.save({
                ...guestItem,
                cart: {
                  id: userCart.id,
                },
                quantity: Math.floor(guestItem.quantity),
              })

              userCart.items.push(newItem)
            }
          }
        }

        // Recalculate donations and totals
        let cartTotal = 0
        let cartGrossDonations = 0
        let cartNetDonations = 0
        const appliedFixedPerOrderDeals = new Set<string>()

        for (const item of userCart.items) {
          const deal = item.deal
          const isFixedPerOrderApplied = appliedFixedPerOrderDeals.has(deal.id)

          item.total = Math.floor(item.quantity) * item.variant.price

          const donation = await DonationHelper(
            deal,
            systemFee,
            payload.user,
            item.total,
            Math.floor(item.quantity),
            isFixedPerOrderApplied,
          )

          item.system_fee = donation.system_fee
          item.gross_donations = donation.amount
          item.net_donations = donation.net_amount

          if (deal.donation_type === DonationType.FIXED_PER_ORDER && !isFixedPerOrderApplied) {
            appliedFixedPerOrderDeals.add(deal.id)
          }

          cartTotal += item.total
          cartGrossDonations += item.gross_donations
          cartNetDonations += item.net_donations

          await this.buyNowCartItemRepository.save(item)
        }

        userCart.total = cartTotal
        userCart.gross_donations = cartGrossDonations
        userCart.net_donations = cartNetDonations

        // Apply coupon discount if applicable
        if (userCart.coupon) {
          userCart.total_discount = await CalculateDiscount(userCart.coupon, {
            ...userCart,
            is_buynow: true,
          })
        }

        await this.buyNowCartRepository.save(userCart)

        // Remove the guest cart
        await this.buyNowCartRepository.delete(guestCart.id)
      }
    } catch (error) {
      console.error('Error merging cart', error)
    }
  }
}
