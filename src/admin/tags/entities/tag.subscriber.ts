import { DataSource, EventSubscriber } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import { MyEventSubscriber } from '@app/src/shared/base/my.subscriber'
import { TagEntity } from './tag.entity'

@EventSubscriber()
@Injectable()
export class TagSubscriber extends MyEventSubscriber<TagEntity> {
  constructor(@InjectDataSource() readonly dataSource: DataSource) {
    super(dataSource, TagEntity)
  }
}
