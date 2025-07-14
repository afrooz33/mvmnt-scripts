import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { MyService } from '@app/src/shared/base'
import { UserService } from '@app/src/users/user/user.service'
import { CouponsService } from '@app/src/coupons/coupons.service'
import { AddressService } from '@app/src/users/address/address.service'
import { SystemFeeService } from '@app/src/admin/system-fee/system-fee.service'
import { BuynowCartEntity } from '@app/src/users/deal/buynow/entities/cart.entity'
import { InventoryService } from '@app/src/sales-history/shipping/inventory.service'
import { OrderRoutingService } from '@app/src/users/order-routing/order-routing.service'
import { BuynowCartItemEntity } from '@app/src/users/deal/buynow/entities/cart-item.entity'
import { ShippingProfilesService } from '@app/src/users/shipping-profiles/shipping-profiles.service'
import { DeliverySettingsService } from '@app/src/users/delivery-settings/delivery-settings.service'
import { getCartService, updateCartAddressService, updateCartDeliveryService } from './services'

@Injectable()
export class CheckoutService extends MyService<BuynowCartEntity> {
  /**
   * Constructs a new instance of the CheckoutService class which uses the buynow cart entity as the base entity.
   *
   * @param {Repository<BuynowCartEntity>} buynowCartRepository - The repository for BuynowCartEntity.
   */
  constructor(
    @InjectRepository(BuynowCartEntity)
    private readonly buynowCartRepository: Repository<BuynowCartEntity>,
    @InjectRepository(BuynowCartItemEntity)
    private readonly buynowCartItemRepository: Repository<BuynowCartItemEntity>,
    private readonly userService: UserService,
    private readonly systemFeeService: SystemFeeService,
    private readonly entityManager: EntityManager,
    private readonly addressService: AddressService,
    private readonly shippingProfileService: ShippingProfilesService,
    private readonly deliverySettingService: DeliverySettingsService,
    private readonly orderRoutingService: OrderRoutingService,
    private readonly couponsService: CouponsService,
    private readonly inventoryService: InventoryService,
  ) {
    super(buynowCartRepository, 'user/checkout')
  }

  getCart = getCartService.bind(this)
  updateCartAddress = updateCartAddressService.bind(this)
  updateCartDelivery = updateCartDeliveryService.bind(this)
}
