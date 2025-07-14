import { Injectable } from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource, EventSubscriber } from 'typeorm'
import { MyEventSubscriber } from '@app/src/shared/base/my.subscriber'
import { HomepagesEntity } from './homepages.entity'

@EventSubscriber()
@Injectable()
export class HomepageSubscriber extends MyEventSubscriber<HomepagesEntity> {
  constructor(@InjectDataSource() readonly dataSource: DataSource) {
    super(dataSource, HomepagesEntity)
  }
}
