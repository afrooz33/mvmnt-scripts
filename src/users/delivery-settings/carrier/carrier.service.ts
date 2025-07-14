import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { OnEvent } from '@nestjs/event-emitter'
import { InjectRepository } from '@nestjs/typeorm'
import { MyService } from '@app/src/shared/base'
import { IEventEmitter } from '@app/src/shared/interfaces'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { UserService } from '@app/src/users/user/user.service'
import { DeliverySettingStatus } from '@app/src/users/delivery-settings/enums'
import { DeliverySettingsEntity } from '@app/src/users/delivery-settings//entities/delivery-settings.entity'
import { DeliveryCarrierEntity } from './entities/delivery-carrier.entity'
import { createService, updateService, deleteService } from './services'

@Injectable()
export class DeliveryCarrierService extends MyService<DeliveryCarrierEntity> {
  constructor(
    @InjectRepository(DeliveryCarrierEntity)
    private readonly deliveryCarrierRepository: Repository<DeliveryCarrierEntity>,
    @InjectRepository(DeliverySettingsEntity)
    private readonly deliverySettingsRepository: Repository<DeliverySettingsEntity>,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    super(deliveryCarrierRepository, 'users/delivery-settings/carrier')
  }

  create = createService.bind(this)
  update = updateService.bind(this)
  delete = deleteService.bind(this)

  /**
   * @description code to handle custom events
   */
  @OnEvent('user.signup')
  async setDefaultCarrier(event: IEventEmitter): Promise<void> {
    try {
      const prefix = 'DEFAULT_CARRIER_'

      for (let i = 1; ; i++) {
        const carrierName = await this.configService.get<string>(`${prefix}NAME_${i}`)
        const carrierTimeSlot = await this.configService.get<string>(`${prefix}TIMESLOT_${i}`)

        if (!carrierName || !carrierTimeSlot) {
          break
        }

        const data = {
          name: carrierName,
          time_slot: JSON.parse(carrierTimeSlot),
          status: DeliverySettingStatus.ENABLED,
        }

        await this.updateOne({
          ...data,
          user: {
            id: event['id'],
          },
        })
      }
    } catch (error) {
      return HandleErrors(error)
    }
  }
}
