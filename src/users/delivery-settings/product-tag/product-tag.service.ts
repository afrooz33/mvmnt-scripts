import { Repository } from 'typeorm'
import { OnEvent } from '@nestjs/event-emitter'
import { InjectRepository } from '@nestjs/typeorm'
import { Injectable, PreconditionFailedException } from '@nestjs/common'
import { MyService } from '@app/src/shared/base'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { AccountStatus } from '@app/src/users/user/enums'
import { IEventEmitter } from '@app/src/shared/interfaces'
import { UserService } from '@app/src/users/user/user.service'
import { DeliverySettingStatus, DeliverySettingsType } from '@app/src/users/delivery-settings/enums'
import { DeliverySettingsEntity } from '@app/src/users/delivery-settings/entities/delivery-settings.entity'
import { ProductTagSettingsEntity } from './entities/product-tag-settings.entity'
import { createService, deleteService, updateService } from './services'

@Injectable()
export class ProductTagService extends MyService<ProductTagSettingsEntity> {
  constructor(
    @InjectRepository(ProductTagSettingsEntity)
    private readonly productTagSettingsRepository: Repository<ProductTagSettingsEntity>,
    @InjectRepository(DeliverySettingsEntity)
    private readonly deliverySettingsRepository: Repository<DeliverySettingsEntity>,
    private readonly userService: UserService,
  ) {
    super(productTagSettingsRepository, 'users/delivery-settings/product-tag')
  }

  checkPrecondition = async (payload, userId: string): Promise<void> => {
    if (payload.date_range && payload.days_range) {
      throw new PreconditionFailedException(ErrorKey.BOTH_DATE_RANGE_AND_DAYS_RANGE_NOT_ALLOWED)
    }

    await this.userService.documentExists({
      condition: [
        {
          where: {
            id: userId,
            account_status: AccountStatus.ENABLED,
          },
          select: ['id'],
        },
      ],
      errorMessage: ErrorKey.USER_NOT_FOUND,
    })
  }

  create = createService.bind(this)
  update = updateService.bind(this)
  delete = deleteService.bind(this)

  /**
   * @description code to handle custom events
   */
  @OnEvent('user.signup')
  async setDefaultProductTag(event: IEventEmitter): Promise<void> {
    try {
      let delivery_settings = await this.deliverySettingsRepository.findOne({
        where: {
          user: {
            id: event['id'],
          },
          type: DeliverySettingsType.PRODUCT_TAG,
        },
        select: ['id'],
      })

      if (!delivery_settings) {
        delivery_settings = await this.deliverySettingsRepository.save({
          type: DeliverySettingsType.PRODUCT_TAG,
          user: {
            id: event['id'],
          },
          is_enabled: true,
        })
      }

      await this.updateOne({
        name: 'Disable delivery date',
        is_disable_delivery_tag: true,
        days_range: null,
        date_range: null,
        status: DeliverySettingStatus.ENABLED,
        delivery_settings: {
          id: delivery_settings.id,
        },
      })
    } catch (error) {
      return HandleErrors(error)
    }
  }
}
