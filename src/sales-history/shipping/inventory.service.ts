import { InjectRepository } from '@nestjs/typeorm'
import { Repository, DataSource, LessThan, FindOptionsWhere } from 'typeorm'
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common'
import { MyService } from '@app/src/shared/base'
import { BidEntity } from '@app/src/users/deal/bid/entities/bid.entity'
import { OrderRoutingService } from '@app/src/users/order-routing/order-routing.service'
import { BuynowCartItemEntity } from '@app/src/users/deal/buynow/entities/cart-item.entity'
import { DealVariantInventoryEntity } from '@app/src/users/deal/entities/deal-variant-inventory.entity'
import { OrderOriginReservationEntity } from './entities/order-origin-reservations.entity'

@Injectable()
export class InventoryService extends MyService<DealVariantInventoryEntity> {
  constructor(
    @InjectRepository(DealVariantInventoryEntity)
    private readonly inventoryRepository: Repository<DealVariantInventoryEntity>,
    @InjectRepository(OrderOriginReservationEntity)
    private readonly reservationRepository: Repository<OrderOriginReservationEntity>,
    private readonly orderRoutingService: OrderRoutingService,
    private readonly dataSource: DataSource,
  ) {
    super(inventoryRepository, 'inventory')
  }

  /**
   * Check if sufficient inventory is available for a variant
   */
  async checkInventoryAvailability(variantId: string, quantity: number): Promise<boolean> {
    const availableOrigins = await this.getAvailableOriginsForVariant(variantId)
    const totalAvailable = availableOrigins.reduce((sum, origin) => sum + origin.available, 0)
    return totalAvailable >= quantity
  }

  /**
   * Reserve inventory for a cart item based on order routing
   */
  async reserveInventory(
    cartItem: { id: string; variant: { id: string } },
    sellerId: string,
    buyerAddressId: string,
  ): Promise<boolean> {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // Get full cart item details if needed
      let cartItemQuantity = 0
      let cartId: string | null = null

      try {
        const fullCartItem = await this.dataSource.getRepository(BuynowCartItemEntity).findOne({
          where: { id: cartItem.id },
          relations: ['cart'],
          select: {
            id: true,
            quantity: true,
            cart: {
              id: true,
            },
          },
        })

        if (fullCartItem) {
          cartItemQuantity = Number(fullCartItem.quantity)
          cartId = fullCartItem.cart?.id
        }
      } catch (error) {
        // If we can't get the quantity, use default 1
        cartItemQuantity = 1
      }

      // Clean up expired reservations
      await this.cleanExpiredReservations()

      // Check if we already have reservations for this cart item
      const existingReservations = await queryRunner.manager.find(OrderOriginReservationEntity, {
        where: { cart_item: { id: cartItem.id } },
      })

      if (existingReservations.length > 0) {
        // Already has reservations, commit transaction and return
        await queryRunner.commitTransaction()
        return true
      }

      // Get best origins using order routing (ensure this doesn't cause nested transactions if called within)
      const routingResult = await this.orderRoutingService.getRoutingForOrder(
        cartItem.variant.id,
        sellerId,
        buyerAddressId,
        cartItemQuantity,
      )

      if (!routingResult?.applicableOrigins?.length) {
        await queryRunner.rollbackTransaction() // Rollback if no origins found
        return false
      }

      for (const originInfo of routingResult.applicableOrigins) {
        // Find the inventory for this origin and variant (use queryRunner.manager)
        const inventory = await queryRunner.manager.findOne(DealVariantInventoryEntity, {
          where: {
            variant: { id: cartItem.variant.id },
            origin: { id: originInfo.origin.id },
          },
          relations: ['origin'],
        })

        if (!inventory) {
          console.warn(
            `Inventory not found for variant ${cartItem.variant.id} at origin ${originInfo.origin.id} during reservation.`,
          )
          continue
        }

        // Re-check available quantity *within* the transaction before reserving
        // This requires adapting getInventoryForOrigin or similar logic here
        const currentInventoryInfo = await this.getInventoryForOrigin(
          cartItem.variant.id,
          originInfo.origin.id /* pass queryRunner.manager if needed */,
        )

        if (currentInventoryInfo.available < originInfo.quantity) {
          console.warn(
            `Inventory check failed within transaction for origin ${originInfo.origin.id}. Available: ${currentInventoryInfo.available}, Needed: ${originInfo.quantity}`,
          )
          // Decide how to handle: skip origin, fail transaction, etc.
          // For now, we'll skip this origin and try others. If quantity isn't met later, the overall reservation might fail.
          continue
        }

        // Create a temporary reservation (expires in 45 minutes)
        const expiresAt = new Date()
        expiresAt.setMinutes(expiresAt.getMinutes() + 45)

        const reservation = new OrderOriginReservationEntity()
        // Cast to 'any' or ensure type compatibility if needed
        reservation.cart_item = { id: cartItem.id } as any

        if (cartId) {
          reservation.cart = { id: cartId } as any
        }

        reservation.origin = originInfo.origin
        reservation.inventory = inventory
        reservation.quantity = originInfo.quantity
        reservation.expires_at = expiresAt

        await queryRunner.manager.save(OrderOriginReservationEntity, reservation)
      }

      await queryRunner.commitTransaction()
      return true
    } catch (error) {
      await queryRunner.rollbackTransaction()
      return false
    } finally {
      await queryRunner.release()
    }
  }

  /**
   * Get shipping origins for a cart item
   */
  async getShippingOriginsForCartItem(cartItemId: string): Promise<any[]> {
    const reservations = await this.reservationRepository.find({
      where: { cart_item: { id: cartItemId } },
      relations: ['origin', 'cart'],
    })

    return reservations.map((reservation) => ({
      originId: reservation.origin.id,
      originName: reservation.origin.name || reservation.origin.id,
      quantity: Number(reservation.quantity),
      isShipped: reservation.is_shipped,
      shippedAt: reservation.shipped_at,
      cartId: reservation.cart?.id,
    }))
  }

  /**
   * Get inventory for origin
   */
  async getInventoryForOrigin(
    variantId: string,
    originId: string,
  ): Promise<{ available: number; total: number; reserved: number }> {
    // Get the total inventory
    const inventory = await this.inventoryRepository.findOne({
      where: {
        variant: { id: variantId },
        origin: { id: originId },
      },
    })

    if (!inventory) {
      return { available: 0, total: 0, reserved: 0 }
    }

    // Get reserved inventory
    const reservationResult = await this.dataSource
      .createQueryBuilder()
      .select('COALESCE(SUM(reservation.quantity), 0)', 'reserved')
      .from(OrderOriginReservationEntity, 'reservation')
      .where('reservation.inventoryId = :inventoryId', { inventoryId: inventory.id })
      .andWhere('reservation.is_shipped = false')
      .andWhere('(reservation.expires_at > NOW() OR reservation.expires_at IS NULL)')
      .getRawOne()

    const reserved = Number(reservationResult?.reserved || 0)
    const available = Math.max(0, Number(inventory.quantity) - reserved)

    return {
      available,
      total: Number(inventory.quantity),
      reserved,
    }
  }

  /**
   * Get all origins with available inventory for a variant
   */
  async getAvailableOriginsForVariant(
    variantId: string,
  ): Promise<Array<{ originId: string; available: number }>> {
    const inventories = await this.inventoryRepository.find({
      where: {
        variant: { id: variantId },
      },
      relations: ['origin'],
    })

    const result = []

    for (const inventory of inventories) {
      const inventoryInfo = await this.getInventoryForOrigin(variantId, inventory.origin.id)
      if (inventoryInfo.available > 0) {
        result.push({
          originId: inventory.origin.id,
          available: inventoryInfo.available,
        })
      }
    }

    return result
  }

  /**
   * Reserve inventory for a cart item from specific origin
   */
  async reserveInventoryFromOrigin(
    cartItemId: string,
    originId: string,
    quantity: number,
  ): Promise<boolean> {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // Get the cart item
      const cartItem = await queryRunner.manager.findOne(BuynowCartItemEntity, {
        where: { id: cartItemId },
        relations: ['variant', 'cart'],
      })

      if (!cartItem) {
        throw new NotFoundException(`Cart item ${cartItemId} not found`)
      }

      // Get the inventory
      const inventory = await queryRunner.manager.findOne(DealVariantInventoryEntity, {
        where: {
          variant: { id: cartItem.variant.id },
          origin: { id: originId },
        },
        relations: ['origin'],
      })

      if (!inventory) {
        throw new NotFoundException(`No inventory found for origin ${originId}`)
      }

      // Check available inventory
      const inventoryInfo = await this.getInventoryForOrigin(cartItem.variant.id, originId)
      if (inventoryInfo.available < quantity) {
        throw new BadRequestException(
          `Not enough inventory available. Requested: ${quantity}, Available: ${inventoryInfo.available}`,
        )
      }

      // Check if a reservation already exists
      const existingReservation = await queryRunner.manager.findOne(OrderOriginReservationEntity, {
        where: {
          cart_item: { id: cartItemId },
          origin: { id: originId },
          is_shipped: false,
        },
      })

      if (existingReservation) {
        // If reservation exists, update it
        existingReservation.quantity = Number(existingReservation.quantity) + quantity
        existingReservation.expires_at = null // Permanent reservation
        await queryRunner.manager.save(OrderOriginReservationEntity, existingReservation)
      } else {
        // Otherwise create a new reservation
        const reservation = new OrderOriginReservationEntity()
        reservation.cart_item = cartItem
        if (cartItem.cart) {
          reservation.cart = cartItem.cart
        }
        reservation.origin = inventory.origin
        reservation.inventory = inventory
        reservation.quantity = quantity
        reservation.expires_at = null // Permanent reservation
        await queryRunner.manager.save(OrderOriginReservationEntity, reservation)
      }

      await queryRunner.commitTransaction()
      return true
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  /**
   * Reserve inventory for a bid from specific origin
   */
  async reserveBidInventoryFromOrigin(
    bidId: string,
    originId: string,
    quantity: number,
  ): Promise<boolean> {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // Get the bid
      const bid = await queryRunner.manager.findOne(BidEntity, {
        where: { id: bidId },
        relations: ['deal'],
      })

      if (!bid) {
        throw new NotFoundException(`Bid ${bidId} not found`)
      }

      // Get the inventory (for auction, need to get by deal not variant)
      const inventory = await queryRunner.manager.findOne(DealVariantInventoryEntity, {
        where: {
          variant: { deal: { id: bid.deal.id } },
          origin: { id: originId },
        },
        relations: ['origin', 'variant'],
      })

      if (!inventory) {
        throw new NotFoundException(`No inventory found for origin ${originId}`)
      }

      // Check available inventory
      const inventoryInfo = await this.getInventoryForOrigin(inventory.variant.id, originId)
      if (inventoryInfo.available < quantity) {
        throw new BadRequestException(
          `Not enough inventory available. Requested: ${quantity}, Available: ${inventoryInfo.available}`,
        )
      }

      // Check if a reservation already exists
      const existingReservation = await queryRunner.manager.findOne(OrderOriginReservationEntity, {
        where: {
          bid: { id: bidId },
          origin: { id: originId },
          is_shipped: false,
        },
      })

      if (existingReservation) {
        // If reservation exists, update it
        existingReservation.quantity = Number(existingReservation.quantity) + quantity
        existingReservation.expires_at = null // Permanent reservation
        await queryRunner.manager.save(OrderOriginReservationEntity, existingReservation)
      } else {
        // Otherwise create a new reservation
        const reservation = new OrderOriginReservationEntity()
        reservation.bid = bid
        reservation.origin = inventory.origin
        reservation.inventory = inventory
        reservation.quantity = quantity
        reservation.expires_at = null // Permanent reservation
        await queryRunner.manager.save(OrderOriginReservationEntity, reservation)
      }

      await queryRunner.commitTransaction()
      return true
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  /**
   * Mark reserved inventory as shipped. Can handle partial quantities.
   */
  async markReservationAsShipped(
    cartItemId: string | null,
    bidId: string | null,
    originId: string,
    quantity: number,
    shippingItemId: string,
    existingQueryRunner?: any,
  ): Promise<boolean> {
    // Use provided query runner or create a new one
    const queryRunner = existingQueryRunner || this.dataSource.createQueryRunner()
    const localTransaction = !existingQueryRunner

    if (localTransaction) {
      await queryRunner.connect()
      await queryRunner.startTransaction()
    }

    try {
      // Find the specific, unshipped reservation for this item AND origin
      const whereClause: FindOptionsWhere<OrderOriginReservationEntity> = {
        origin: { id: originId },
        is_shipped: false,
      }

      if (cartItemId) {
        whereClause.cart_item = { id: cartItemId }
      } else {
        whereClause.bid = { id: bidId }
      }

      // Lock the reservation row
      const reservation = await queryRunner.manager.findOne(OrderOriginReservationEntity, {
        where: whereClause,
        relations: ['origin', 'inventory', 'cart_item', 'cart_item.cart', 'bid'],
      })

      if (!reservation) {
        throw new NotFoundException('Reservation not found')
      }

      const reservedQuantity = Number(reservation.quantity)

      if (reservedQuantity < quantity) {
        throw new BadRequestException(
          `Not enough reserved quantity at origin ${originId}. Reserved: ${reservedQuantity}, Requested to ship: ${quantity}`,
        )
      }

      // Logic for splitting or updating the reservation remains the same
      if (reservedQuantity === quantity) {
        reservation.is_shipped = true
        reservation.shipped_at = new Date()
        reservation.shipping_item = { id: shippingItemId } as any
        await queryRunner.manager.save(OrderOriginReservationEntity, reservation)
      } else {
        // Reduce original reservation
        reservation.quantity = reservedQuantity - quantity
        await queryRunner.manager.save(OrderOriginReservationEntity, reservation)
        // Create new shipped reservation record
        const shippedReservation = queryRunner.manager.create(OrderOriginReservationEntity, {
          cart_item: reservation.cart_item,
          cart: reservation.cart_item?.cart,
          bid: reservation.bid,
          origin: reservation.origin,
          inventory: reservation.inventory,
          quantity: quantity,
          is_shipped: true,
          shipped_at: new Date(),
          expires_at: null,
          shipping_item: { id: shippingItemId } as any,
        })
        await queryRunner.manager.save(OrderOriginReservationEntity, shippedReservation)
      }

      if (localTransaction) {
        await queryRunner.commitTransaction()
      }
      return true
    } catch (error) {
      if (localTransaction) {
        await queryRunner.rollbackTransaction()
      }
      throw error
    } finally {
      if (localTransaction) {
        await queryRunner.release()
      }
    }
  }

  /**
   * Get reserved origins for a cart item
   */
  async getReservedOriginsForCartItem(
    cartItemId: string,
  ): Promise<Array<{ originId: string; quantity: number; isShipped: boolean }>> {
    const reservations = await this.reservationRepository.find({
      where: {
        cart_item: { id: cartItemId },
      },
      relations: ['origin', 'cart'],
    })

    return reservations.map((reservation) => ({
      originId: reservation.origin.id,
      quantity: Number(reservation.quantity),
      isShipped: reservation.is_shipped,
      cartId: reservation.cart?.id,
    }))
  }

  /**
   * Get reserved origins for a bid
   */
  async getReservedOriginsForBid(
    bidId: string,
  ): Promise<Array<{ originId: string; quantity: number; isShipped: boolean }>> {
    const reservations = await this.reservationRepository.find({
      where: {
        bid: { id: bidId },
      },
      relations: ['origin'],
    })

    return reservations.map((reservation) => ({
      originId: reservation.origin.id,
      quantity: Number(reservation.quantity),
      isShipped: reservation.is_shipped,
    }))
  }

  /**
   * Get the best shipping origins based on order routing
   */
  async getBestShippingOrigins(
    variantId: string,
    sellerId: string,
    buyerAddressId: string,
    quantity: number,
  ): Promise<Array<{ originId: string; quantity: number }>> {
    const routingResult = await this.orderRoutingService.getRoutingForOrder(
      variantId,
      sellerId,
      buyerAddressId,
      quantity,
    )

    if (!routingResult || !routingResult.applicableOrigins.length) {
      throw new NotFoundException('No suitable shipping origins found')
    }

    return routingResult.applicableOrigins.map((originInfo) => ({
      originId: originInfo.origin.id,
      quantity: originInfo.quantity,
    }))
  }

  /**
   * Clean up expired reservations
   */
  async cleanExpiredReservations(): Promise<void> {
    const now = new Date()
    await this.reservationRepository.delete({
      expires_at: LessThan(now),
      is_shipped: false,
    })
  }

  /**
   * Clean up reservations for a specific cart item
   */
  async cleanReservationsForCartItem(cartItemId: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // Find all reservations for this cart item
      const reservations = await queryRunner.manager.find(OrderOriginReservationEntity, {
        where: { cart_item: { id: cartItemId } },
      })

      if (reservations.length > 0) {
        // Delete all reservations for this cart item
        await queryRunner.manager.delete(OrderOriginReservationEntity, {
          cart_item: { id: cartItemId },
        })
      }

      await queryRunner.commitTransaction()
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  /**
   * Clean up reservations for a specific cart
   */
  async cleanReservationsForCart(cartId: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // Find all reservations for this cart
      const reservations = await queryRunner.manager.find(OrderOriginReservationEntity, {
        where: { cart: { id: cartId } },
      })

      if (reservations.length > 0) {
        // Delete all reservations for this cart
        await queryRunner.manager.delete(OrderOriginReservationEntity, {
          cart: { id: cartId },
        })
      }

      await queryRunner.commitTransaction()
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }
}
