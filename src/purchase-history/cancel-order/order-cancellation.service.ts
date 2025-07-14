import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, DataSource, In, Not } from 'typeorm'
import { NotFoundException, BadRequestException } from '@nestjs/common'
import { PaginateRO } from '@app/src/shared/dto'
import { MyPaginateDto, MyService } from '@app/src/shared/base'
import { ErrorKey } from '@app/src/shared/enums/error-key.enum'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { BidStatus } from '@app/src/users/deal/bid/enums'
import { CartStatus } from '@app/src/users/deal/buynow/enums'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { BidEntity } from '@app/src/users/deal/bid/entities/bid.entity'
import { NotificationsService } from '@app/src/notifications/notifications.service'
import { BuynowCartEntity } from '@app/src/users/deal/buynow/entities/cart.entity'
import { BuynowCartItemEntity } from '@app/src/users/deal/buynow/entities/cart-item.entity'
import { CancellationStatus, CancellationLogAction, CancellationReason } from './enums'
import { OrderCancellationEntity } from './entities/order-cancellation.entity'
import { OrderCancellationLogEntity } from './entities/order-cancellation-log.entity'
import { OrderCancellationItemEntity } from './entities/order-cancellation-item.entity'
import { CreateCancellationDto } from './dto'
import {
  NotificationReceiverType,
  NotificationRelatedTo,
  NotificationType,
} from '@app/src/notifications/enums'
import { DealType } from '@app/src/users/deal/enums'

@Injectable()
export class OrderCancellationService extends MyService<OrderCancellationEntity> {
  constructor(
    @InjectRepository(OrderCancellationEntity)
    private readonly cancellationRepository: Repository<OrderCancellationEntity>,
    @InjectRepository(OrderCancellationItemEntity)
    private readonly cancellationItemRepository: Repository<OrderCancellationItemEntity>,
    @InjectRepository(OrderCancellationLogEntity)
    private readonly cancellationLogRepository: Repository<OrderCancellationLogEntity>,
    @InjectRepository(BuynowCartEntity)
    private readonly cartRepository: Repository<BuynowCartEntity>,
    @InjectRepository(BuynowCartItemEntity)
    private readonly cartItemRepository: Repository<BuynowCartItemEntity>,
    @InjectRepository(BidEntity)
    private readonly bidRepository: Repository<BidEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly dataSource: DataSource,
    private readonly notificationsService: NotificationsService,
  ) {
    super(cancellationRepository, 'order-cancellation')
  }

  /**
   * Create a cancellation request
   * @param payload Cancellation request data
   * @param buyerId Buyer ID
   */
  async createCancellationRequest(
    payload: CreateCancellationDto,
    buyerId: string,
  ): Promise<OrderCancellationEntity> {
    try {
      let bid: BidEntity | null = null
      let cart: BuynowCartEntity | null = null
      let sellerId: string | null = null

      // Validation: bid and cart cannot be present at the same time
      if (payload.bid && payload.cart) {
        throw new BadRequestException(ErrorKey.INVALID_CANCELLATION_PAYLOAD)
      }

      // Handle Auction cancellations
      if (payload.bid) {
        if (payload.items.length > 1) {
          throw new BadRequestException(ErrorKey.INVALID_CANCELLATION_PAYLOAD)
        }

        bid = await this.bidRepository.findOne({
          where: {
            id: payload.bid,
            user: { id: buyerId },
            status: In([BidStatus.WAITING_SHIPMENT, BidStatus.COMPLETED]),
          },
          relations: ['deal', 'deal.user'],
          select: {
            id: true,
            quantity: true,
            deal: {
              id: true,
              user: {
                id: true,
              },
            },
          },
        })

        if (!bid) {
          throw new NotFoundException(ErrorKey.INVALID_BID)
        }

        // Check for existing cancellation requests for this bid
        const activeRequests = await this.cancellationRepository.find({
          where: {
            bid: { id: bid.id },
            status: In([CancellationStatus.REQUESTED, CancellationStatus.APPROVED]),
          },
          relations: ['items'],
        })

        let existingCancelQuantity = 0

        // Calculate the total quantity already requested for cancellation
        for (const request of activeRequests) {
          for (const item of request.items) {
            existingCancelQuantity += item.quantity_to_cancel
          }
        }

        // Add the new requested cancellation quantity
        const totalRequestedCancelQuantity =
          existingCancelQuantity + payload.items[0].quantity_to_cancel

        // Check if the total requested cancellation quantity exceeds the original bid quantity
        if (totalRequestedCancelQuantity > bid.quantity) {
          throw new BadRequestException(ErrorKey.MISMATCH_ORDER_QUANTITY)
        }

        // Set the seller ID from the deal's owner
        sellerId = bid.deal.user.id
      }

      // Handle BuyNow cancellations
      if (payload.cart) {
        cart = await this.cartRepository.findOne({
          where: {
            id: payload.cart,
            user: { id: buyerId },
            status: Not(
              In([
                CartStatus.PENDING,
                CartStatus.SHIPPED,
                CartStatus.CANCELLED,
                CartStatus.REVIEW_DEAL,
              ]),
            ),
          },
          relations: ['user', 'seller'],
          select: {
            id: true,
            user: {
              id: true,
            },
            seller: {
              id: true,
            },
          },
        })

        if (!cart) {
          throw new NotFoundException(ErrorKey.INVALID_CART)
        }

        // Set the seller ID from the cart
        sellerId = cart.seller.id

        // Get the cart items the user wants to cancel
        const cartItemIds = payload.items.map((item) => item.cart_item)
        const cartItems = await this.cartItemRepository.find({
          where: {
            id: In(cartItemIds),
            cart: { id: cart.id },
          },
          select: {
            id: true,
            quantity: true,
            deal: {
              id: true,
            },
          },
          relations: ['deal'],
        })

        if (cartItems.length !== cartItemIds.length) {
          throw new BadRequestException(ErrorKey.INVALID_CART_ITEM)
        }

        // Quantity validation
        for (const requestedItem of payload.items) {
          const cartItem = cartItems.find((ci) => ci.id === requestedItem.cart_item)

          if (!cartItem) {
            throw new NotFoundException(ErrorKey.INVALID_CART_ITEM)
          }

          // Check for existing cancellation requests for this item
          const activeRequests = await this.cancellationItemRepository.find({
            where: {
              cart_item: { id: requestedItem.cart_item },
              status: In([CancellationStatus.REQUESTED, CancellationStatus.APPROVED]),
            },
          })

          const sumActive = activeRequests.reduce((acc, i) => acc + i.quantity_to_cancel, 0)
          const newTotal = sumActive + requestedItem.quantity_to_cancel

          if (newTotal > cartItem.quantity) {
            throw new BadRequestException(ErrorKey.MISMATCH_ORDER_QUANTITY)
          }
        }
      }

      // Begin transaction
      const queryRunner = this.dataSource.createQueryRunner()
      await queryRunner.connect()
      await queryRunner.startTransaction()

      try {
        // Create main cancellation record
        const cancellationData = {
          buyer: { id: buyerId },
          seller: sellerId ? { id: sellerId } : null,
          cart: cart ? { id: cart.id } : null,
          bid: bid ? { id: bid.id } : null,
          status: CancellationStatus.REQUESTED,
          requested_at: new Date(),
        }

        const savedRequest = await queryRunner.manager.save(
          OrderCancellationEntity,
          cancellationData,
        )

        // Create item records
        let savedItems: OrderCancellationItemEntity[] = []

        if (payload.items && payload.items.length > 0) {
          const itemsToSave: OrderCancellationItemEntity[] = []

          for (const item of payload.items) {
            let dealId: string | null = null

            // Get the deal ID from the cart item if available
            if (item.cart_item) {
              const cartItem = await queryRunner.manager.findOne(BuynowCartItemEntity, {
                where: { id: item.cart_item },
                relations: ['deal'],
                select: {
                  id: true,
                  deal: {
                    id: true,
                  },
                },
              })

              dealId = cartItem?.deal?.id ?? null
            }

            // Create a new entity instance
            const newItem = new OrderCancellationItemEntity()
            // Set relations using object notation for type safety
            newItem.cancellation = { id: savedRequest.id } as OrderCancellationEntity
            newItem.cart_item = item.cart_item
              ? ({ id: item.cart_item } as BuynowCartItemEntity)
              : null
            newItem.deal = dealId ? ({ id: dealId } as DealEntity) : null
            newItem.quantity_to_cancel = item.quantity_to_cancel
            newItem.reason = item.reason
            newItem.status = CancellationStatus.REQUESTED

            itemsToSave.push(newItem)
          }

          savedItems = await queryRunner.manager.save(OrderCancellationItemEntity, itemsToSave)
        } else if (bid) {
          let reason = CancellationReason.OTHER

          if (payload.bid) {
            reason = payload.items[0].reason
          }

          // For bids, we need to create a single cancellation item for the bid
          const bidCancellationItem = new OrderCancellationItemEntity()
          bidCancellationItem.cancellation = { id: savedRequest.id } as OrderCancellationEntity
          bidCancellationItem.deal = { id: bid.deal.id } as DealEntity
          bidCancellationItem.quantity_to_cancel = payload.items[0].quantity_to_cancel
          bidCancellationItem.reason = reason
          bidCancellationItem.status = CancellationStatus.REQUESTED

          savedItems = [
            await queryRunner.manager.save(OrderCancellationItemEntity, bidCancellationItem),
          ]
        }

        // Add log entry
        await queryRunner.manager.save(OrderCancellationLogEntity, {
          cancellation: { id: savedRequest.id },
          user: { id: buyerId },
          action: CancellationLogAction.REQUEST_CREATED,
          details: {
            is_buynow: !!cart,
            is_auction: !!bid,
            items: savedItems.map((item) => ({
              item_id: item.cart_item?.id || null,
              deal_id: item.deal?.id || null,
              quantity_to_cancel: item.quantity_to_cancel,
              reason: item.reason,
            })),
          },
        })

        await queryRunner.commitTransaction()

        // Send notification to seller
        this.notificationsService.create({
          type: NotificationType.DEAL_ORDER_CANCELLED,
          user: { id: sellerId },
          title: 'Deal order cancelled',
          receiver_type: NotificationReceiverType.USER,
          related_to: NotificationRelatedTo.DEAL,
          data: {
            order_id: savedRequest.id,
            order_type: cart ? DealType.BUYNOW : DealType.AUCTION,
            buyer: savedRequest.buyer.display_name,
            items: cart
              ? savedItems.map((item) => ({
                  deal_id: item.deal?.id || null,
                  deal_name: item.deal?.name || null,
                  item_id: item.cart_item?.id || null,
                  quantity_to_cancel: item.quantity_to_cancel,
                  reason: item.reason,
                }))
              : bid
                ? {
                    deal_id: bid.deal?.id || null,
                    deal_name: bid.deal?.name || null,
                    item_id: bid.id || null,
                    quantity_to_cancel: bid.quantity,
                    reason: payload.items[0]?.reason || CancellationReason.OTHER,
                  }
                : null,
          },
        })

        // Return the complete cancellation request with relations
        return this.findOneCancellationRequest(savedRequest.id, buyerId)
      } catch (err) {
        await queryRunner.rollbackTransaction()
        throw err
      } finally {
        await queryRunner.release()
      }
    } catch (error) {
      return HandleErrors(error)
    }
  }

  /**
   * Find one cancellation request by ID
   * @param id Cancellation request ID
   */
  async findOneCancellationRequest(id: string, userId: string): Promise<OrderCancellationEntity> {
    try {
      const cancellation = await this.cancellationRepository.findOne({
        where: { id, buyer: { id: userId } },
        relations: [
          'buyer',
          'seller',
          'cart',
          'bid',
          'items',
          'logs',
          'logs.user',
          'items.cart_item',
          'items.cart_item.deal',
          'items.cart_item.variant',
          'items.cart_item.variant.images',
          'items.cart_item.variant.option_values',
          'items.cart_item.variant.option_values.option',
        ],
        select: {
          id: true,
          status: true,
          requested_at: true,
          approved_at: true,
          rejected_at: true,
          refunded_at: true,
          seller_notes: true,
          items: {
            id: true,
            status: true,
            quantity_to_cancel: true,
            reason: true,
            cart_item: {
              id: true,
              quantity: true,
              deal: {
                id: true,
                name: true,
                deal_type: true,
              },
              variant: {
                id: true,
                price: true,
                original_price: true,
                images: {
                  id: true,
                  url: true,
                },
                option_values: {
                  id: true,
                  label_name: true,
                  value: true,
                  option: {
                    id: true,
                    type: true,
                  },
                },
              },
            },
          },
          cart: {
            id: true,
            status: true,
          },
          bid: {
            id: true,
          },
          buyer: {
            id: true,
            display_name: true,
            username: true,
          },
          seller: {
            id: true,
            display_name: true,
            username: true,
          },
          logs: {
            id: true,
            action: true,
            details: true,
            user: {
              id: true,
              display_name: true,
              username: true,
            },
          },
        },
      })

      if (!cancellation) {
        throw new NotFoundException(ErrorKey.CANCELLATION_REQUEST_NOT_FOUND)
      }

      return cancellation
    } catch (error) {
      return HandleErrors(error)
    }
  }

  /**
   * Get cancellation requests for a buyer
   * @param buyerId Buyer ID
   */
  async getBuyerCancellationRequests(buyerId: string, query: MyPaginateDto): Promise<PaginateRO> {
    try {
      const results = await new QueryBuilder(query)
        .useQuery(this.cancellationRepository)
        .addRelation('cart')
        .addRelation('bid')
        .addRelation('items')
        .addRelation('buyer')
        .addRelation('seller')
        .addRelation('logs')
        .addRelation('logs.user')
        .create()

      results.condition.andWhere('"buyer"."id" = :buyerId', { buyerId })

      results.condition.orderBy('"requested_at"', 'DESC')

      results.condition.select([
        'data.id',
        'data.created',
        'data.status',
        'data.requested_at',
        'data.approved_at',
        'data.rejected_at',
        'data.refunded_at',
        'data.seller_notes',
        'data.refund_amount',
        'data.seller_notes',
        'buyer.id',
        'buyer.display_name',
        'buyer.username',
        'seller.id',
        'seller.display_name',
        'seller.username',
        'cart.id',
        'cart.status',
        'bid.id',
        'items.id',
        'items.status',
        'items.quantity_to_cancel',
        'items.reason',
        'logs.id',
        'logs.action',
        'logs.details',
        'user.id',
        'user.display_name',
        'user.username',
      ])

      return await this.paginate(results)
    } catch (error) {
      return HandleErrors(error)
    }
  }
}
