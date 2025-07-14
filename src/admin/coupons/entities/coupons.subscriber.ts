import { Injectable } from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource, EventSubscriber } from 'typeorm'
import { MyEventSubscriber } from '@app/src/shared/base/my.subscriber'
import { CouponsEntity } from './coupons.entity'

@EventSubscriber()
@Injectable()
export class CouponsSubscriber extends MyEventSubscriber<CouponsEntity> {
  constructor(@InjectDataSource() readonly dataSource: DataSource) {
    super(dataSource, CouponsEntity)
  }
}
