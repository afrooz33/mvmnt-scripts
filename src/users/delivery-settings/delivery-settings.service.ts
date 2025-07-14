import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { OnEvent } from '@nestjs/event-emitter'
import { InjectRepository } from '@nestjs/typeorm'
import { MyService } from '@app/src/shared/base'
import { IEventEmitter } from '@app/src/shared/interfaces'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { UserService } from '@app/src/users/user/user.service'
import { DealVariantEntity } from '@app/src/users/deal/entities/deal-variant.entity'
import { ShippingProfileEntity } from '@app/src/users/shipping-profiles/entities/shipping-profiles.entity'
import { DeliveryCarrierService } from './carrier/carrier.service'
import { DeliverySettingsEntity } from './entities/delivery-settings.entity'
import { UnattendedSettingEntity } from './entities/unattended-settings.entity'
import { GeneralDeliverySettingsEntity } from './entities/general-delivery-settings.entity'
import {
  showService,
  publicShowService,
  changeStatusService,
  upsertGeneralSettingService,
  publicShippingProfileService,
  calculateDeliveryDateService,
  upsertUnattendedSettingService,
} from './services'

@Injectable()
export class DeliverySettingsService extends MyService<DeliverySettingsEntity> {
  constructor(
    @InjectRepository(DeliverySettingsEntity)
    private readonly deliverySettingsRepository: Repository<DeliverySettingsEntity>,
    @InjectRepository(GeneralDeliverySettingsEntity)
    private readonly generalDeliverySettingsRepository: Repository<GeneralDeliverySettingsEntity>,
    @InjectRepository(UnattendedSettingEntity)
    private readonly unattendedSettingRepository: Repository<UnattendedSettingEntity>,
    @InjectRepository(ShippingProfileEntity)
    private readonly shippingProfileRepository: Repository<ShippingProfileEntity>,
    @InjectRepository(DealVariantEntity)
    private readonly dealVariantRepository: Repository<DealVariantEntity>,
    private readonly deliveryCarrierService: DeliveryCarrierService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    super(deliverySettingsRepository, 'users/delivery-settings')
  }

  show = showService.bind(this)
  changeStatus = changeStatusService.bind(this)
  upsertGeneralSetting = upsertGeneralSettingService.bind(this)
  upsertUnattendedSetting = upsertUnattendedSettingService.bind(this)

  /**
   * @description Public api for getting delivery settings
   */
  publicShow = publicShowService.bind(this)
  publicShippingProfile = publicShippingProfileService.bind(this)
  calculateDeliveryDate = calculateDeliveryDateService.bind(this)

  /**
   * @description code to handle custom events
   */
  @OnEvent('user.signup')
  async setDefaultUnattendedSetting(event: IEventEmitter): Promise<void> {
    try {
      const locations: string = await this.configService.get<string>(
        'DEFAULT_UNATTENDED_DELIVERY_LOCATION',
      )

      await this.upsertUnattendedSetting(
        {
          locations: JSON.parse(locations),
        },
        event['id'],
      )
    } catch (error) {
      return HandleErrors(error)
    }
  }
}
