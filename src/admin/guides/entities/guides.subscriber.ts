import { Injectable } from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource, EventSubscriber } from 'typeorm'
import { MyEventSubscriber } from '@app/src/shared/base/my.subscriber'
import { GuidesEntity } from './guides.entity'

@EventSubscriber()
@Injectable()
export class GuidesSubscriber extends MyEventSubscriber<GuidesEntity> {
  constructor(@InjectDataSource() readonly dataSource: DataSource) {
    super(dataSource, GuidesEntity)
  }
}
