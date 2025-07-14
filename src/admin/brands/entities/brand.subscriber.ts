import { Injectable } from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource, EventSubscriber } from 'typeorm'
import { MyEventSubscriber } from '@app/src/shared/base/my.subscriber'
import { BrandEntity } from './brand.entity'

@EventSubscriber()
@Injectable()
export class BrandSubscriber extends MyEventSubscriber<BrandEntity> {
  constructor(@InjectDataSource() readonly dataSource: DataSource) {
    super(dataSource, BrandEntity)
  }
}
