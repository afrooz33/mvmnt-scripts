import { Injectable } from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource, EventSubscriber } from 'typeorm'
import { MyEventSubscriber } from '@app/src/shared/base/my.subscriber'
import { BannerEntity } from './banner.entity'

@EventSubscriber()
@Injectable()
export class BannerSubscriber extends MyEventSubscriber<BannerEntity> {
  constructor(@InjectDataSource() readonly dataSource: DataSource) {
    super(dataSource, BannerEntity)
  }
}
