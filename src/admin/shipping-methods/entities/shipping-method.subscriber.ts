import { DataSource, EventSubscriber } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import { MyEventSubscriber } from '@app/src/shared/base/my.subscriber'
import { ShippingMethodEntity } from './shipping-method.entity'

@EventSubscriber()
@Injectable()
export class ShippingMethodSubscriber extends MyEventSubscriber<ShippingMethodEntity> {
  constructor(@InjectDataSource() readonly dataSource: DataSource) {
    super(dataSource, ShippingMethodEntity)
  }
}
