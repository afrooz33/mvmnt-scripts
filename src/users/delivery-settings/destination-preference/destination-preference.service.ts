import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { MyService } from '@app/src/shared/base'
import { GeoService } from '@app/src/admin/geo/geo.service'
import { UserService } from '@app/src/users/user/user.service'
import { AddressService } from '@app/src/users/address/address.service'
import { ShippingProfilesService } from '@app/src/users/shipping-profiles/shipping-profiles.service'
import { DeliverySettingsService } from '@app/src/users/delivery-settings/delivery-settings.service'
import { DestinationPreferenceEntity } from './entities/destination-preference.entity'
import { createService, deleteService } from './services'

@Injectable()
export class DestinationPreferenceService extends MyService<DestinationPreferenceEntity> {
  constructor(
    @InjectRepository(DestinationPreferenceEntity)
    private readonly destinationPreferenceRepository: Repository<DestinationPreferenceEntity>,
    private readonly userService: UserService,
    private readonly addressService: AddressService,
    private readonly shippingProfileService: ShippingProfilesService,
    private readonly deliverySettingService: DeliverySettingsService,
    private readonly entityManager: EntityManager,
    private readonly geoService: GeoService,
  ) {
    super(destinationPreferenceRepository, 'users/delivery-settings/destination-preference')
  }

  create = createService.bind(this)
  delete = deleteService.bind(this)
}
