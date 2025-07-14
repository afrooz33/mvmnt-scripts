import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { MyService } from '@app/src/shared/base'
import { UserService } from '@app/src/users/user/user.service'
import { AddressService } from '@app/src/users/address/address.service'
import { AddressEntity } from '@app/src/users/address/entities/address.entity'
import { DealVariantInventoryEntity } from '@app/src/users/deal/entities/deal-variant-inventory.entity'
import { OrderRoutingType } from './enums'
import { OrderRoutingEntity } from './entities/order-routing.entity'
import { createService, deleteService, reorderService, showOneService } from './services'
import { OrderRoutinShippingOriginEntity } from './entities/order-routing-shipping-origins.entity'
import { OrderRoutinShippingOriginGroupEntity } from './entities/order-routing-shipping-origin-groups.entity'
import { ErrorKey } from '@app/src/shared/enums'

@Injectable()
export class OrderRoutingService extends MyService<OrderRoutingEntity> {
  constructor(
    @InjectRepository(OrderRoutingEntity)
    private readonly orderRoutingRepository: Repository<OrderRoutingEntity>,
    @InjectRepository(OrderRoutinShippingOriginGroupEntity)
    private readonly orderRoutingShippingOriginGroupRepository: Repository<OrderRoutinShippingOriginGroupEntity>,
    @InjectRepository(OrderRoutinShippingOriginEntity)
    private readonly orderRoutingShippingOriginRepository: Repository<OrderRoutinShippingOriginEntity>,
    @InjectRepository(DealVariantInventoryEntity)
    private readonly dealVariantInventoryRepository: Repository<DealVariantInventoryEntity>,
    private readonly userService: UserService,
    private readonly addressService: AddressService,
    private readonly entityManager: EntityManager,
  ) {
    super(orderRoutingRepository, 'user/order-routing')
  }

  create = createService.bind(this)
  delete = deleteService.bind(this)
  reOrder = reorderService.bind(this)
  showOne = showOneService.bind(this)

  /**
   * Get the routing for an order, given the variant ID, user ID, buyer address ID, and purchase quantity.
   *
   * @param variantId The ID of the variant.
   * @param sellerId The ID of the user.
   * @param buyerAddressId The ID of the buyer's address.
   * @param purchaseQuantity The quantity of the item being purchased.
   * @returns An object with three properties:
   *  - `totalQuantity`: The total quantity that can be fulfilled from the applicable origins.
   *  - `applicableOrderRouting`: The applicable order routing entity, or null if no order routing can fulfill the purchase quantity.
   *  - `applicableOrigins`: An array of origins that can fulfill the purchase quantity, along with the quantity that each origin can fulfill.
   */
  async getRoutingForOrder(
    variantId: string,
    sellerId: string,
    buyerAddressId: string,
    purchaseQuantity: number,
  ): Promise<{
    totalQuantity: number
    applicableOrderRouting: OrderRoutingEntity | null
    applicableOrigins: Array<{ origin: AddressEntity; quantity: number }>
  }> {
    const buyerAddress = await this.getUserAddress(buyerAddressId)

    if (!buyerAddress) {
      return
    }

    const orderRoutings = await this.orderRoutingRepository
      .createQueryBuilder('user_order_routing')
      .leftJoinAndSelect('user_order_routing.origin_groups', 'originGroups')
      .leftJoinAndSelect('originGroups.origins', 'origins')
      .leftJoinAndSelect('origins.origin', 'originAddress')
      .where('user_order_routing."userId" = :sellerId', { sellerId })
      .orderBy('user_order_routing."display_order"', 'ASC')
      .getMany()

    const selectedOrigins: Array<{ origin: AddressEntity; quantity: number }> = []
    const usedOrigins = new Set<string>() // Track used origin IDs
    let remainingQuantity = purchaseQuantity
    let applicableOrderRouting: OrderRoutingEntity | null = null

    for (const orderRouting of orderRoutings) {
      if (remainingQuantity <= 0) break

      switch (orderRouting.type) {
        case OrderRoutingType.SHIP_FROM_CLOSEST_LOCATION:
          const closestOrigins = await this.getClosestOrigins(
            variantId,
            remainingQuantity,
            buyerAddress,
            usedOrigins,
          )

          if (closestOrigins.length > 0) {
            selectedOrigins.push(...closestOrigins)
            remainingQuantity -= closestOrigins.reduce((sum, origin) => sum + origin.quantity, 0)
            applicableOrderRouting = orderRouting

            if (remainingQuantity <= 0) break
          }
          break

        case OrderRoutingType.USE_RANKED_SHIPPING_ORIGINS:
          const rankedOrigins = await this.getRankedOrigins(
            orderRouting,
            variantId,
            remainingQuantity,
            usedOrigins,
          )
          if (rankedOrigins.length > 0) {
            selectedOrigins.push(...rankedOrigins)
            remainingQuantity -= rankedOrigins.reduce((sum, origin) => sum + origin.quantity, 0)
            applicableOrderRouting = orderRouting

            if (remainingQuantity <= 0) break
          }
          break

        case OrderRoutingType.MINIMIZE_SPLIT_FULFILLMENTS:
          const singleOrigin = await this.getSingleOriginForMinSplit(
            variantId,
            remainingQuantity,
            usedOrigins,
          )
          if (singleOrigin) {
            selectedOrigins.push(singleOrigin)
            remainingQuantity -= singleOrigin.quantity
            applicableOrderRouting = orderRouting

            if (remainingQuantity <= 0) break
          }
          break
      }

      // Mark used origins
      selectedOrigins.forEach((origin) => usedOrigins.add(origin?.origin?.id))
    }

    const canFulfill = remainingQuantity === 0

    return {
      totalQuantity: purchaseQuantity - remainingQuantity,
      applicableOrderRouting: canFulfill ? applicableOrderRouting : null,
      applicableOrigins: canFulfill ? selectedOrigins : [],
    }
  }

  /**
   * Find the closest origin that has inventory available for the given variantId, and
   * can fulfill the given requiredQuantity.
   *
   * @param variantId The ID of the variant to look for.
   * @param requiredQuantity The quantity of the variant that needs to be fulfilled.
   * @param buyerAddress The buyer's address.
   * @param usedOrigins The set of origin IDs that have already been used.
   * @returns An object with the origin and quantity that can fulfill the requiredQuantity.
   *  If no origin can fulfill the requiredQuantity, returns null.
   */
  async getClosestOrigins(
    variantId: string,
    requiredQuantity: number,
    buyerAddress: AddressEntity,
    usedOrigins: Set<string>,
  ): Promise<Array<{ origin: AddressEntity; quantity: number }>> {
    const queryBuilder = this.dealVariantInventoryRepository
      .createQueryBuilder('inventory')
      .leftJoinAndSelect('inventory.origin', 'originAddress')
      .leftJoinAndSelect('originAddress.postcode', 'originPostcode')
      .where('inventory."variantId" = :variantId', { variantId })
      .andWhere('inventory.quantity > 0')

    // Conditionally add the NOT IN clause if usedOrigins is not empty
    if (usedOrigins && usedOrigins.size > 0) {
      queryBuilder.andWhere('inventory."originId" NOT IN (:...usedOrigins)', {
        usedOrigins: Array.from(usedOrigins),
      })
    }

    const inventoryWithOrigins = await queryBuilder.getMany()

    const distances = inventoryWithOrigins
      .map((inventory) => {
        if (!inventory.origin?.postcode?.latitude || !inventory.origin?.postcode?.longitude) {
          return null
        }

        if (!buyerAddress?.postcode?.latitude || !buyerAddress?.postcode?.longitude) {
          throw new BadRequestException(ErrorKey.INVALID_DELIVERY_ADDRESS)
        }

        const originLatitude = inventory.origin.postcode.latitude
        const originLongitude = inventory.origin.postcode.longitude

        const distance = this.calculateHaversineDistance(
          buyerAddress.postcode.latitude,
          buyerAddress.postcode.longitude,
          originLatitude,
          originLongitude,
        )

        return {
          origin: inventory.origin,
          distance,
          inventoryQuantity: inventory.quantity,
        }
      })
      .filter((item) => item !== null)

    const validDistances = distances.filter((item) => item !== null)

    validDistances.sort((a, b) => a.distance - b.distance)

    const selectedOrigins: Array<{ origin: AddressEntity; quantity: number }> = []
    let remainingQuantity = requiredQuantity

    for (const item of validDistances) {
      if (remainingQuantity <= 0) break

      const quantity = Math.min(item.inventoryQuantity, remainingQuantity)
      if (quantity > 0) {
        selectedOrigins.push({ origin: item.origin, quantity })
        remainingQuantity -= quantity
      }
    }

    return selectedOrigins
  }

  private calculateHaversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371 // Radius of the Earth in km
    const dLat = this.degreesToRadians(lat2 - lat1)
    const dLon = this.degreesToRadians(lon2 - lon1)

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degreesToRadians(lat1)) *
        Math.cos(this.degreesToRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  }

  private degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180)
  }

  /**
   * Get the ranked origins that can fulfill the given variantId and requiredQuantity
   * from the given order routing.
   *
   * @param orderRouting The order routing entity.
   * @param variantId The ID of the variant.
   * @param requiredQuantity The quantity of the item being purchased.
   * @param usedOrigins The set of origin IDs that have already been used.
   * @returns An array of origin and quantity pairs.
   */
  private async getRankedOrigins(
    orderRouting: OrderRoutingEntity,
    variantId: string,
    requiredQuantity: number,
    usedOrigins: Set<string>,
  ): Promise<Array<{ origin: AddressEntity; quantity: number }>> {
    let remainingQuantity = requiredQuantity

    const selectedOrigins: Array<{ origin: AddressEntity; quantity: number }> = []

    for (const group of orderRouting.origin_groups) {
      if (remainingQuantity <= 0) break

      for (const origin of group.origins) {
        if (usedOrigins.has(origin.origin.id)) continue

        const inventory = await this.getOriginInventory(origin.origin.id, variantId)

        if (inventory && inventory.quantity > 0) {
          const quantityToAllocate = Math.min(remainingQuantity, inventory.quantity)

          selectedOrigins.push({
            origin: origin.origin,
            quantity: quantityToAllocate,
          })

          remainingQuantity -= quantityToAllocate

          if (remainingQuantity <= 0) break
        }
      }
    }

    return selectedOrigins
  }

  /**
   * Find a single origin that can fulfill the given `requiredQuantity` of the variant with `variantId` from the given `orderRouting`.
   *
   * @param orderRouting The order routing entity.
   * @param variantId The ID of the variant.
   * @param requiredQuantity The quantity of the item being purchased.
   * @returns An object with the origin and quantity that can fulfill the requiredQuantity, or null if no origin can fulfill the requiredQuantity.
   */
  private async getSingleOriginForMinSplit(
    variantId: string,
    requiredQuantity: number,
    usedOrigins: Set<string>,
  ): Promise<{ origin: AddressEntity; quantity: number } | null> {
    const originInventory = await this.entityManager
      .getRepository(DealVariantInventoryEntity)
      .createQueryBuilder('inventory')
      .leftJoinAndSelect('inventory.origin', 'originAddress')
      .where('inventory."variantId" = :variantId', { variantId })
      .andWhere('inventory.quantity >= :requiredQuantity', { requiredQuantity })
      .orderBy('inventory.quantity', 'DESC')

    if (usedOrigins.size) {
      originInventory.andWhere('inventory."originId" NOT IN (:...usedOrigins)', {
        usedOrigins: Array.from(usedOrigins),
      })
    }

    const finalInventory = await originInventory.getOne()

    return originInventory ? { origin: finalInventory.origin, quantity: requiredQuantity } : null
  }

  /**
   * Get the inventory for a given origin and variant.
   *
   * @param originId The ID of the origin.
   * @param variantId The ID of the variant.
   * @returns An object with the quantity of the inventory, or null if no inventory is found.
   */
  private async getOriginInventory(
    originId: string,
    variantId: string,
  ): Promise<{ quantity: number } | null> {
    return this.dealVariantInventoryRepository
      .createQueryBuilder('inventory')
      .where('inventory."originId" = :originId', { originId })
      .andWhere('inventory."variantId" = :variantId', { variantId })
      .getOne()
  }

  /**
   * Get an address by its ID.
   *
   * @param addressId The ID of the address.
   * @returns The address entity, or null if not found.
   */
  private async getUserAddress(addressId: string): Promise<AddressEntity | null> {
    return this.entityManager
      .getRepository(AddressEntity)
      .createQueryBuilder('address')
      .leftJoinAndSelect('address.postcode', 'postcode')
      .where('address.id = :addressId', { addressId })
      .getOne()
  }
}
