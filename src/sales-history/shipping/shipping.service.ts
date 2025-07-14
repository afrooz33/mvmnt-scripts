import { InjectRepository } from '@nestjs/typeorm'
import { Repository, DataSource, In, FindOptionsWhere } from 'typeorm'
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { MyService } from '@app/src/shared/base'
import { ErrorKey } from '@app/src/shared/enums'
import { CartStatus } from '@app/src/users/deal/buynow/enums'
import { BidStatus } from '@app/src/users/deal/bid/enums'
import { UserService } from '@app/src/users/user/user.service'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { BidEntity } from '@app/src/users/deal/bid/entities/bid.entity'
import { AddressService } from '@app/src/users/address/address.service'
import { BuynowService } from '@app/src/users/deal/buynow/buynow.service'
import { AddressEntity } from '@app/src/users/address/entities/address.entity'
import { BuynowCartEntity } from '@app/src/users/deal/buynow/entities/cart.entity'
import { DeliveryCarrierEntity } from '@app/src/users/delivery-settings/carrier/entities/delivery-carrier.entity'
import { OrderOriginReservationEntity } from '@app/src/sales-history/shipping/entities/order-origin-reservations.entity'
import { ShippingStatus } from './enums'
import { InventoryService } from './inventory.service'
import { OrderShippingEntity } from './entities/order-shipping.entity'
import { OrderShippingItemEntity } from './entities/order-shipping-item.entity'
import { CreateShippingDto, UpdateShippingStatusDto, OriginShippingDto } from './dto'
import { OrderShippingTrackingEntity } from './entities/order-shipping-tracking.entity'

@Injectable()
export class ShippingService extends MyService<OrderShippingEntity> {
  constructor(
    @InjectRepository(OrderShippingEntity)
    private orderShippingRepository: Repository<OrderShippingEntity>,
    @InjectRepository(OrderShippingItemEntity)
    private orderShippingItemRepository: Repository<OrderShippingItemEntity>,
    @InjectRepository(OrderShippingTrackingEntity)
    private orderShippingTrackingRepository: Repository<OrderShippingTrackingEntity>,
    @InjectRepository(DeliveryCarrierEntity)
    private deliveryCarrierRepository: Repository<DeliveryCarrierEntity>,
    @InjectRepository(BidEntity)
    private bidRepository: Repository<BidEntity>,
    private dataSource: DataSource,
    private userService: UserService,
    private buynowService: BuynowService,
    private addressService: AddressService,
    private inventoryService: InventoryService,
  ) {
    super(orderShippingRepository, 'sales-history/shipping')
  }

  /**
   * Creates (or re‐uses) a shipping record for the given cart or bid.
   * Then optionally adds an initial batch of shipping items (partial or full).
   * Also checks not to exceed the originally purchased quantity for each item.
   */
  async createShipping(
    createShippingDto: CreateShippingDto,
    userId: string,
  ): Promise<OrderShippingEntity> {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      let buyer: UserEntity | null = null
      let cart: BuynowCartEntity | null = null
      let bid: BidEntity | null = null
      let orderItemIdField: 'cart_item' | 'bid' = 'cart_item'

      // Validate that top-level shipping_origin is provided
      if (!createShippingDto.shipping_origin) {
        throw new BadRequestException('shipping_origin must be provided for the shipment.')
      }

      const shippingOriginId = createShippingDto.shipping_origin // *** USE TOP-LEVEL ORIGIN ***

      // Validate that either cart or bid is provided, but not both
      if (
        (!createShippingDto.cart && !createShippingDto.bid) ||
        (createShippingDto.cart && createShippingDto.bid)
      ) {
        throw new BadRequestException(ErrorKey.INVALID_PAYLOAD)
      }
      const seller = await queryRunner.manager.findOneBy(UserEntity, { id: userId })

      if (!seller) {
        throw new NotFoundException(ErrorKey.USER_NOT_FOUND)
      }

      let deliveryAddress: AddressEntity | null = null

      if (createShippingDto.cart) {
        cart = await queryRunner.manager.findOne(BuynowCartEntity, {
          where: {
            id: createShippingDto.cart,
            status: In([
              CartStatus.COMPLETED,
              CartStatus.WAITING_SHIPMENT,
              CartStatus.PARTIALLY_SHIPPED,
            ]),
            seller: { id: userId },
          },
          relations: ['user', 'seller', 'items', 'delivery_address'],
          select: {
            id: true,
            user: { id: true, account_type: true },
            seller: { id: true, account_type: true },
            items: { id: true, quantity: true, delivery_date: true, delivery_time_slot: true },
            delivery_address: { id: true },
          },
        })

        if (!cart) {
          throw new NotFoundException(ErrorKey.INVALID_CART)
        }

        buyer = cart.user
        deliveryAddress = cart.delivery_address
        orderItemIdField = 'cart_item'
      } else if (createShippingDto.bid) {
        bid = await queryRunner.manager.findOne(BidEntity, {
          where: {
            id: createShippingDto.bid,
            status: In([BidStatus.WAITING_SHIPMENT]),
            deal: { user: { id: userId } },
          },
          relations: ['user', 'deal', 'deal.user', 'address'],
          select: {
            id: true,
            quantity: true,
            user: { id: true, account_type: true },
            deal: {
              id: true,
              user: { id: true, account_type: true },
            },
            address: { id: true },
          },
        })

        if (!bid) {
          throw new NotFoundException(ErrorKey.INVALID_BID)
        }

        buyer = bid.user
        deliveryAddress = bid.address
        orderItemIdField = 'bid'
      }
      if (!buyer) {
        throw new NotFoundException(ErrorKey.USER_NOT_FOUND)
      }

      if (!deliveryAddress) {
        throw new BadRequestException('Delivery address is missing for the order.')
      }

      const returnAddress = await queryRunner.manager.findOne(AddressEntity, {
        where: { id: createShippingDto.return_address, profile: { user: { id: userId } } },
      })

      if (!returnAddress) {
        throw new NotFoundException(ErrorKey.INVALID_RETURN_ADDRESS)
      }

      // Find or Create Shipping Record
      let shipping = await queryRunner.manager.findOne(OrderShippingEntity, {
        where: bid ? { bid: { id: bid.id } } : { cart: { id: cart!.id } },
        relations: ['items', 'items.cart_item', 'items.bid'],
      })

      if (!shipping) {
        shipping = queryRunner.manager.create(OrderShippingEntity, {
          payment: createShippingDto.payment ? { id: createShippingDto.payment } : undefined,
          cart: cart ? { id: cart.id } : undefined,
          bid: bid ? { id: bid.id } : undefined,
          seller: { id: seller.id },
          buyer: { id: buyer.id },
          delivery_address: { id: deliveryAddress.id },
          return_address: { id: returnAddress.id },
          status: ShippingStatus.PENDING,
          buyer_message: createShippingDto.buyer_message,
          internal_message: createShippingDto.internal_message,
          items: [],
        })
        shipping = await queryRunner.manager.save(OrderShippingEntity, shipping)
      }

      // Create Shipping Items & Mark Reservations
      if (!createShippingDto.items || createShippingDto.items.length === 0) {
        throw new BadRequestException('Shipment must contain at least one item.')
      }

      for (const itemDto of createShippingDto.items) {
        if (itemDto.quantity <= 0) throw new BadRequestException(ErrorKey.INVALID_QUANTITY)

        let originalItemQuantity = 0
        let targetItemId: string | null = null // This is the CartItem ID or Bid ID
        let itemIdentifierForQuery: any = {} // For reservation check

        // Validate item identifier and quantity
        if (cart) {
          targetItemId = itemDto.cart_item // DTO carries cart_item_id
          const cartItem = cart.items.find((ci) => ci.id === targetItemId)
          if (!cartItem)
            throw new NotFoundException(`Cart item ${targetItemId} not found in cart ${cart.id}.`)
          originalItemQuantity = Number(cartItem.quantity)
          itemIdentifierForQuery = { cart_item: { id: targetItemId } }
        } else if (bid) {
          targetItemId = bid.id // For bids, the 'item' is the bid itself
          // The DTO's cart_item field is repurposed for bids; validate it matches the bid ID.
          if (itemDto.cart_item !== bid.id) {
            throw new BadRequestException(
              `Item identifier (cart_item) ${itemDto.cart_item} does not match bid ${bid.id}.`,
            )
          }
          originalItemQuantity = Number(bid.quantity)
          itemIdentifierForQuery = { bid: { id: targetItemId } }
        }

        // Check Total Shipped Quantity
        const relatedShippingItems = await queryRunner.manager.find(OrderShippingItemEntity, {
          where:
            orderItemIdField === 'cart_item'
              ? { cart_item: { id: targetItemId! }, shipping: { cart: { id: cart!.id } } }
              : { bid: { id: targetItemId! }, shipping: { bid: { id: bid!.id } } },
        })
        const totalShippedSoFar = relatedShippingItems.reduce(
          (sum, si) => sum + Number(si.quantity),
          0,
        )
        if (totalShippedSoFar + itemDto.quantity > originalItemQuantity) {
          throw new BadRequestException(
            `Cannot ship ${itemDto.quantity} more units of item ${targetItemId}. Already shipped ${totalShippedSoFar}, total purchased ${originalItemQuantity}.`,
          )
        }

        // Validate Reservation for this Origin
        const reservation = await queryRunner.manager.findOne(OrderOriginReservationEntity, {
          where: {
            ...itemIdentifierForQuery,
            origin: { id: shippingOriginId }, // *** Check against the top-level origin ***
            is_shipped: false, // Must be unshipped
          },
          select: { id: true, quantity: true },
        })

        if (!reservation || Number(reservation.quantity) < itemDto.quantity) {
          throw new BadRequestException(
            `Item ${targetItemId} does not have enough unshipped reservation quantity (${
              reservation?.quantity || 0
            }) at the specified origin ${shippingOriginId} to ship ${itemDto.quantity} units.`,
          )
        }

        // Create the new shipping item
        const newShippingItemData: Partial<OrderShippingItemEntity> = {
          shipping: { id: shipping.id } as any,
          quantity: itemDto.quantity,
          shipped_at: itemDto.shipped_at ? new Date(itemDto.shipped_at) : new Date(),
        }
        if (orderItemIdField === 'cart_item') {
          newShippingItemData.cart_item = { id: targetItemId! } as any
        } else {
          newShippingItemData.bid = { id: targetItemId! } as any
        }

        const newShippingItem = queryRunner.manager.create(
          OrderShippingItemEntity,
          newShippingItemData,
        )
        const savedItem = await queryRunner.manager.save(OrderShippingItemEntity, newShippingItem)

        // Mark Reservation as Shipped (using top-level shippingOriginId)
        await this.inventoryService.markReservationAsShipped(
          cart ? targetItemId : null,
          bid ? targetItemId : null,
          shippingOriginId,
          itemDto.quantity,
          savedItem.id,
          queryRunner,
        )
      }

      // Add Tracking Info
      if (createShippingDto.tracking_details && createShippingDto.tracking_details.length > 0) {
        const trackingDetailsToSave = createShippingDto.tracking_details.map((tracking) => {
          return queryRunner.manager.create(OrderShippingTrackingEntity, {
            shipping: { id: shipping!.id },
            tracking_number: tracking.tracking_number,
            delivery_carrier: tracking.delivery_carrier ? { id: tracking.delivery_carrier } : null,
          })
        })
        await queryRunner.manager.save(OrderShippingTrackingEntity, trackingDetailsToSave)
      }

      // Update Shipping & Order Statuses
      const finalShippingState = await queryRunner.manager.findOne(OrderShippingEntity, {
        where: { id: shipping.id },
        relations: ['items', 'items.cart_item', 'items.bid', 'cart', 'cart.items', 'bid'],
      })

      if (!finalShippingState) {
        throw new Error('Failed to reload shipping state.')
      }

      await this.updateOrderAndShippingStatus(finalShippingState, queryRunner)

      await queryRunner.commitTransaction()

      return this.findOne(shipping.id)
    } catch (error) {
      await queryRunner.rollbackTransaction()
      return HandleErrors(error)
    } finally {
      await queryRunner.release()
    }
  }

  async findAll(): Promise<OrderShippingEntity[]> {
    return this.orderShippingRepository.find({
      relations: [
        'items',
        'tracking_details',
        'cart',
        'cart.user',
        'cart.seller',
        'items.cart_item',
        'bid',
        'bid.user',
        'bid.deal',
        'bid.deal.user',
      ],
    })
  }

  async findOne(id: string): Promise<OrderShippingEntity> {
    const shipping = await this.orderShippingRepository.findOne({
      where: { id },
      relations: [
        'items',
        'items.cart_item',
        'tracking_details',
        'cart',
        'cart.user',
        'cart.seller',
        'bid',
        'bid.user',
        'bid.deal',
        'bid.deal.user',
        'delivery_address',
        'return_address',
        'tracking_details.delivery_carrier',
      ],
      select: {
        items: { cart_item: { id: true, quantity: true } },
        tracking_details: {
          tracking_number: true,
          delivery_carrier: { id: true, name: true },
        },
        cart: {
          id: true,
          status: true,
          user: { id: true, username: true },
          seller: { id: true, username: true },
        },
        bid: {
          id: true,
          status: true,
          user: { id: true, username: true },
          deal: {
            id: true,
            user: { id: true, username: true },
          },
        },
        delivery_address: {
          id: true,
          city: true,
          state: true,
          country: { id: true, name: true },
          postcode: { id: true, postcode: true },
        },
        return_address: {
          id: true,
          city: true,
          state: true,
          country: { id: true, name: true },
          postcode: { id: true, postcode: true },
        },
      },
    })

    if (!shipping) {
      throw new NotFoundException(`Shipping with ID ${id} not found`)
    }

    return shipping
  }

  /**
   * Allows partial or full shipments for an existing shipping record.
   * For cart-based orders, we handle multiple cart items with partial shipments.
   * For bid-based orders, we handle the single auction item.
   */
  async updateShippingStatus(
    id: string,
    updateStatusDto: UpdateShippingStatusDto,
  ): Promise<OrderShippingEntity> {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()
    try {
      const shipping = await queryRunner.manager.findOne(this.orderShippingRepository.target, {
        where: { id },
        relations: ['cart', 'cart.items', 'bid', 'items', 'items.cart_item'],
      })

      if (!shipping) {
        throw new NotFoundException(`Shipping with ID ${id} not found`)
      }

      if (!updateStatusDto.itemsToShip || updateStatusDto.itemsToShip.length === 0) {
        throw new BadRequestException('No items provided to update shipping status.')
      }

      // Handle cart-based shipping
      if (shipping.cart) {
        // For each item we want to ship now
        for (const itemUpdate of updateStatusDto.itemsToShip) {
          const cartItem = shipping.cart.items.find((ci) => ci.id === itemUpdate.cart_item)
          if (!cartItem) {
            throw new NotFoundException(
              `Cart item ${itemUpdate.cart_item} not found on cart ${shipping.cart.id}`,
            )
          }

          if (itemUpdate.quantity <= 0) {
            throw new BadRequestException(`Quantity must be > 0 for cart item ${cartItem.id}`)
          }

          // Check how many have shipped so far for this cartItem
          const totalShippedResult = await queryRunner.manager
            .createQueryBuilder()
            .select('SUM(item.quantity)', 'sum')
            .from(OrderShippingItemEntity, 'item')
            .leftJoin('item.cart_item', 'cart_item')
            .leftJoin('item.shipping', 'shipping')
            .where('cart_item.id = :cartItemId', { cartItemId: cartItem.id })
            .andWhere('shipping.cartId = :cartId', { cartId: shipping.cart.id })
            .getRawOne()

          const totalShippedSoFar = Number(totalShippedResult?.sum || 0)
          const newTotal = totalShippedSoFar + itemUpdate.quantity

          if (newTotal > cartItem.quantity) {
            throw new BadRequestException(
              `Cannot ship ${itemUpdate.quantity} more units of cartItem ${cartItem.id}.
               Already shipped ${totalShippedSoFar}, total purchased ${cartItem.quantity}.`,
            )
          }

          // Create a brand‐new partial shipment record
          const newShippingItem = new OrderShippingItemEntity()
          newShippingItem.shipping = shipping
          newShippingItem.cart_item = cartItem
          newShippingItem.quantity = itemUpdate.quantity
          newShippingItem.shipped_at = new Date()

          await queryRunner.manager.save(OrderShippingItemEntity, newShippingItem)
        }
      }
      // Handle bid-based shipping
      else if (shipping.bid) {
        const itemUpdate = updateStatusDto.itemsToShip[0] // Only one item for bid

        if (itemUpdate.quantity <= 0) {
          throw new BadRequestException(`Quantity must be > 0 for bid ${shipping.bid.id}`)
        }

        // Check how many have shipped so far for this bid
        const totalShippedResult = await queryRunner.manager
          .createQueryBuilder()
          .select('SUM(item.quantity)', 'sum')
          .from(OrderShippingItemEntity, 'item')
          .leftJoin('item.shipping', 'shipping')
          .where('shipping.bidId = :bidId', { bidId: shipping.bid.id })
          .getRawOne()

        const totalShippedSoFar = Number(totalShippedResult?.sum || 0)
        const newTotal = totalShippedSoFar + itemUpdate.quantity

        if (newTotal > shipping.bid.quantity) {
          throw new BadRequestException(
            `Cannot ship ${itemUpdate.quantity} more units for bid ${shipping.bid.id}.
             Already shipped ${totalShippedSoFar}, total purchased ${shipping.bid.quantity}.`,
          )
        }

        // Create a new partial shipment record
        const newShippingItem = new OrderShippingItemEntity()
        newShippingItem.shipping = shipping
        newShippingItem.quantity = itemUpdate.quantity
        newShippingItem.shipped_at = new Date()

        await queryRunner.manager.save(OrderShippingItemEntity, newShippingItem)
      }

      // If tracking info is provided, attach it
      if (updateStatusDto.tracking) {
        const trackingDetail = new OrderShippingTrackingEntity()
        trackingDetail.shipping = shipping
        trackingDetail.tracking_number = updateStatusDto.tracking.tracking_number
        trackingDetail.delivery_carrier = updateStatusDto.tracking.delivery_carrier as any

        await queryRunner.manager.save(OrderShippingTrackingEntity, trackingDetail)
      }

      // Update cart/bid & shipping status
      await this.updateOrderAndShippingStatus(shipping, queryRunner)

      await queryRunner.commitTransaction()
      return this.findOne(shipping.id)
    } catch (error) {
      await queryRunner.rollbackTransaction()
      return HandleErrors(error)
    } finally {
      await queryRunner.release()
    }
  }

  /**
   * Update both the order (cart or bid) status and the shipping status based on
   * how many total items have been shipped.
   */
  private async updateOrderAndShippingStatus(
    shipping: OrderShippingEntity,
    queryRunner?: any,
  ): Promise<void> {
    try {
      let orderId: string | undefined
      let orderType: 'cart' | 'bid' | null = null
      let totalPurchasedQuantity = 0

      // Identify order type and ID, calculate total purchased quantity
      if (shipping.cart) {
        orderId = shipping.cart.id
        orderType = 'cart'
        if (!shipping.cart.items) {
          const cartWithItems = await queryRunner.manager.findOne(BuynowCartEntity, {
            where: { id: orderId },
            relations: ['items'],
          })
          if (!cartWithItems) throw new NotFoundException(ErrorKey.INVALID_CART)
          shipping.cart = cartWithItems // Ensure items are loaded
        }
        totalPurchasedQuantity = shipping.cart.items.reduce(
          (sum, ci) => sum + Number(ci.quantity),
          0,
        )
      } else if (shipping.bid) {
        orderId = shipping.bid.id
        orderType = 'bid'
        if (shipping.bid?.quantity === undefined || shipping.bid?.quantity === null) {
          const bidWithQty = await queryRunner.manager.findOneBy(BidEntity, { id: orderId })
          if (!bidWithQty) throw new NotFoundException(ErrorKey.INVALID_BID)
          shipping.bid = bidWithQty // Load bid if not fully loaded
        }
        totalPurchasedQuantity = Number(shipping.bid.quantity)
      } else {
        console.warn(`Shipping record ${shipping.id} has no associated cart or bid.`)
        return // Exit if no order link
      }

      // Calculate Total Reserved and Shipped Quantities from Reservations
      const reservationWhereClause: FindOptionsWhere<OrderOriginReservationEntity> = {}
      if (orderType === 'cart') {
        reservationWhereClause.cart = { id: orderId }
      } else {
        reservationWhereClause.bid = { id: orderId }
      }

      // Get ALL reservations for the order
      const allReservations = await queryRunner.manager.find(OrderOriginReservationEntity, {
        where: reservationWhereClause,
      })

      // Use totalPurchasedQuantity as the benchmark for completion
      // Calculate total shipped quantity based on *shipped* reservations
      const totalShippedReservationQuantity = allReservations
        .filter((res) => res.is_shipped)
        .reduce((sum, res) => sum + Number(res.quantity), 0)

      // Determine and Update Order Status (Cart or Bid)
      let newOrderStatus: CartStatus | BidStatus | undefined
      let currentOrderStatus: CartStatus | BidStatus | undefined

      if (orderType === 'cart') {
        currentOrderStatus = shipping.cart!.status
        // Condition: Is total quantity marked as shipped in reservations >= total quantity purchased?
        if (totalShippedReservationQuantity >= totalPurchasedQuantity) {
          newOrderStatus = CartStatus.SHIPPED
        } else if (totalShippedReservationQuantity > 0) {
          newOrderStatus = CartStatus.PARTIALLY_SHIPPED
        } else {
          // If nothing shipped *from reservations*, keep WAITING_SHIPMENT or PARTIALLY_SHIPPED if already set
          newOrderStatus =
            currentOrderStatus === CartStatus.WAITING_SHIPMENT ||
            currentOrderStatus === CartStatus.PARTIALLY_SHIPPED
              ? currentOrderStatus
              : CartStatus.WAITING_SHIPMENT // Default if starting from e.g. COMPLETED
        }
        // Update Cart Status
        if (newOrderStatus !== currentOrderStatus) {
          await queryRunner.manager.update(BuynowCartEntity, orderId!, { status: newOrderStatus })
        }
      } else {
        // orderType === 'bid'
        currentOrderStatus = shipping.bid!.status
        if (totalShippedReservationQuantity >= totalPurchasedQuantity) {
          newOrderStatus = BidStatus.COMPLETED // Auction is COMPLETED when fully shipped
        } else {
          // Bids remain WAITING_SHIPMENT until fully shipped/completed
          newOrderStatus = BidStatus.WAITING_SHIPMENT
        }
        // Update Bid Status
        if (newOrderStatus !== currentOrderStatus) {
          await queryRunner.manager.update(BidEntity, orderId!, { status: newOrderStatus })
        }
      }

      // Determine and Update *This* Shipping Record's Status
      let newShippingStatus = shipping.status
      // Base the shipping status on the overall order shipment progress derived from reservations
      if (totalShippedReservationQuantity >= totalPurchasedQuantity) {
        // If overall order is fully shipped, this specific shipment record can be marked SHIPPED
        // (unless it's already DELIVERED). Delivery tracking is separate.
        if (shipping.status !== ShippingStatus.DELIVERED) {
          newShippingStatus = ShippingStatus.SHIPPED
        }
      } else if (totalShippedReservationQuantity > 0) {
        // If *any* part of the order is shipped (even if not in *this* specific shipping record),
        // mark this record as PARTIALLY_SHIPPED, as the order itself is partially shipped.
        newShippingStatus = ShippingStatus.PARTIALLY_SHIPPED
      } else {
        newShippingStatus = ShippingStatus.PENDING
      }

      if (newShippingStatus !== shipping.status) {
        await queryRunner.manager.update(OrderShippingEntity, shipping.id, {
          status: newShippingStatus,
        })
      }
    } catch (error) {
      throw error
    }
  }

  /**
   * Get shipping data by cart ID (assuming one shipping record per cart).
   */
  async getShippingStatusByCartId(cartId: string): Promise<OrderShippingEntity> {
    const shippingRecord = await this.orderShippingRepository.findOne({
      where: { cart: { id: cartId } },
      relations: [
        'items',
        'items.cart_item',
        'tracking_details',
        'tracking_details.delivery_carrier',
      ],
    })

    if (!shippingRecord) {
      throw new NotFoundException(`No shipping record found for cart ${cartId}`)
    }

    return shippingRecord
  }

  /**
   * Get shipping data by bid ID (assuming one shipping record per bid).
   */
  async getShippingStatusByBidId(bidId: string): Promise<OrderShippingEntity> {
    const shippingRecord = await this.orderShippingRepository.findOne({
      where: { bid: { id: bidId } },
      relations: ['items', 'tracking_details', 'tracking_details.delivery_carrier'],
    })

    if (!shippingRecord) {
      throw new NotFoundException(`No shipping record found for bid ${bidId}`)
    }

    return shippingRecord
  }

  /**
   * Create shipping record with origin-specific inventory
   */
  async createShippingWithOrigins(
    shippingId: string,
    originShippingDto: OriginShippingDto,
    userId: string,
  ): Promise<OrderShippingEntity> {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // Retrieve the shipping record
      const shipping = await queryRunner.manager.findOne(OrderShippingEntity, {
        where: { id: shippingId, seller: { id: userId } },
        relations: ['cart', 'cart.items', 'bid'],
      })

      if (!shipping) {
        throw new NotFoundException(`Shipping record ${shippingId} not found`)
      }

      // Process cart items
      if (shipping.cart && originShippingDto.cartItems) {
        for (const cartItemDto of originShippingDto.cartItems) {
          // Verify the cart item belongs to the cart
          const cartItem = shipping.cart.items.find((ci) => ci.id === cartItemDto.cart_item)
          if (!cartItem) {
            throw new BadRequestException(
              `Cart item ${cartItemDto.cart_item} does not belong to this order`,
            )
          }

          // Calculate total quantity being shipped
          const totalQuantity = cartItemDto.origins.reduce((sum, o) => sum + o.quantity, 0)
          if (totalQuantity <= 0) {
            throw new BadRequestException('Total quantity must be greater than 0')
          }

          // Create shipping item record
          const shippingItem = new OrderShippingItemEntity()
          shippingItem.shipping = shipping
          shippingItem.cart_item = cartItem
          shippingItem.quantity = totalQuantity
          shippingItem.shipped_at = new Date()
          const savedShippingItem = await queryRunner.manager.save(
            OrderShippingItemEntity,
            shippingItem,
          )

          // Mark reservations as shipped for each origin
          for (const origin of cartItemDto.origins) {
            await this.inventoryService.markReservationAsShipped(
              cartItem.id,
              null,
              origin.originId,
              origin.quantity,
              savedShippingItem.id,
              queryRunner,
            )
          }
        }
      }
      // Process bid
      else if (shipping.bid && originShippingDto.bid) {
        // Calculate total quantity being shipped
        const totalQuantity = originShippingDto.bid.origins.reduce((sum, o) => sum + o.quantity, 0)
        if (totalQuantity <= 0) {
          throw new BadRequestException('Total quantity must be greater than 0')
        }

        // Create shipping item record
        const shippingItem = new OrderShippingItemEntity()
        shippingItem.shipping = shipping
        shippingItem.quantity = totalQuantity
        shippingItem.shipped_at = new Date()
        const savedShippingItem = await queryRunner.manager.save(
          OrderShippingItemEntity,
          shippingItem,
        )

        // Mark reservations as shipped for each origin
        for (const origin of originShippingDto.bid.origins) {
          await this.inventoryService.markReservationAsShipped(
            null,
            shipping.bid.id,
            origin.originId,
            origin.quantity,
            savedShippingItem.id,
            queryRunner,
          )
        }
      } else {
        throw new BadRequestException('No valid cart items or bid provided')
      }

      // Update shipping status using the existing service method
      await this.updateOrderAndShippingStatus(shipping, queryRunner)

      // Add message if provided
      if (originShippingDto.buyer_message) {
        shipping.buyer_message = originShippingDto.buyer_message
      }
      if (originShippingDto.internal_message) {
        shipping.internal_message = originShippingDto.internal_message
      }
      await queryRunner.manager.save(OrderShippingEntity, shipping)

      await queryRunner.commitTransaction()

      // Return the updated shipping record
      return this.findOne(shippingId)
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  /**
   * Get available origins for a cart item
   */
  async getAvailableOriginsForCartItem(cartItemId: string): Promise<any> {
    const cartItem = await this.buynowService.buyNowCartItemRepository.findOne({
      where: { id: cartItemId },
      relations: ['variant', 'cart', 'cart.delivery_address', 'cart.seller'],
    })

    if (!cartItem) {
      throw new NotFoundException(`Cart item ${cartItemId} not found`)
    }

    // Get reserved origins
    const reservedOrigins = await this.inventoryService.getReservedOriginsForCartItem(cartItemId)

    // If we have reservations, return them
    if (reservedOrigins.length > 0) {
      return {
        cartItemId,
        reservedOrigins,
      }
    }

    // Otherwise, get recommended origins from order routing
    if (!cartItem.cart.delivery_address) {
      throw new BadRequestException('Cart has no delivery address')
    }

    try {
      const recommendedOrigins = await this.inventoryService.getBestShippingOrigins(
        cartItem.variant.id,
        cartItem.cart.seller.id,
        cartItem.cart.delivery_address.id,
        Number(cartItem.quantity),
      )

      return {
        cartItemId,
        recommendedOrigins,
      }
    } catch (error) {
      // If routing fails, return all available origins
      const availableOrigins = await this.inventoryService.getAvailableOriginsForVariant(
        cartItem.variant.id,
      )

      return {
        cartItemId,
        availableOrigins,
      }
    }
  }

  /**
   * Get available origins for a bid
   */
  async getAvailableOriginsForBid(bidId: string): Promise<any> {
    // Similar to cart item logic but for bids
    // First check for existing reservations
    const reservedOrigins = await this.inventoryService.getReservedOriginsForBid(bidId)

    if (reservedOrigins.length > 0) {
      return {
        bidId,
        reservedOrigins,
      }
    }

    // Return all available origins for the bid's deal variant
    // This would require retrieving the bid and its deal/variant details
    // For now, return placerholder until we have more context about bid structure
    return {
      bidId,
      message: 'No reserved origins found. Please reserve inventory before shipping.',
    }
  }

  /**
   * Reserve inventory from specific origins for a cart item
   */
  async reserveInventoryForCartItem(
    cartItemId: string,
    origins: Array<{ originId: string; quantity: number }>,
  ): Promise<boolean> {
    const cartItem = await this.buynowService.buyNowCartItemRepository.findOne({
      where: { id: cartItemId },
      relations: ['variant'],
    })

    if (!cartItem) {
      throw new NotFoundException(`Cart item ${cartItemId} not found`)
    }

    // Calculate total quantity
    const totalQuantity = origins.reduce((sum, o) => sum + o.quantity, 0)
    if (totalQuantity !== Number(cartItem.quantity)) {
      throw new BadRequestException(
        `Total reserved quantity (${totalQuantity}) must match cart item quantity (${cartItem.quantity})`,
      )
    }

    // Reserve each origin
    for (const origin of origins) {
      await this.inventoryService.reserveInventoryFromOrigin(
        cartItemId,
        origin.originId,
        origin.quantity,
      )
    }

    return true
  }

  /**
   * Get shipping items with their reserved origins
   */
  async getShippingItemsWithOrigins(shippingId: string): Promise<any> {
    const shipping = await this.findOne(shippingId)

    if (!shipping) {
      throw new NotFoundException(`Shipping record ${shippingId} not found`)
    }

    const result = {
      shippingId,
      status: shipping.status,
      cartItems: [],
      bid: null,
    }

    // Get origin information for cart items
    if (shipping.cart) {
      for (const item of shipping.items) {
        if (item.cart_item) {
          const origins = await this.inventoryService.getReservedOriginsForCartItem(
            item.cart_item.id,
          )
          result.cartItems.push({
            cartItemId: item.cart_item.id,
            quantity: Number(item.quantity),
            origins: origins.filter((o) => o.isShipped),
            remainingOrigins: origins.filter((o) => !o.isShipped),
          })
        }
      }
    }

    // Get origin information for bid
    if (shipping.bid) {
      const origins = await this.inventoryService.getReservedOriginsForBid(shipping.bid.id)
      result.bid = {
        bidId: shipping.bid.id,
        quantity: shipping.bid.quantity,
        origins: origins.filter((o) => o.isShipped),
        remainingOrigins: origins.filter((o) => !o.isShipped),
      }
    }

    return result
  }
}
