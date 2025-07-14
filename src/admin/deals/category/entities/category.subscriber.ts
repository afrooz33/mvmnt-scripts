import { DataSource, EventSubscriber } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import { MyEventSubscriber } from '@app/src/shared/base/my.subscriber'
import { DealCategoryEntity } from './deal-category.entity'

@EventSubscriber()
@Injectable()
export class CategorySubscriber extends MyEventSubscriber<DealCategoryEntity> {
  constructor(@InjectDataSource() readonly dataSource: DataSource) {
    super(dataSource, DealCategoryEntity)
  }
}
