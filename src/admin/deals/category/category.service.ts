import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MyService } from '@app/src/shared/base'
import { DealCategoryEntity } from './entities/deal-category.entity'
import { showService } from './services'

@Injectable()
export class DealCategoryService extends MyService<DealCategoryEntity> {
  constructor(
    @InjectRepository(DealCategoryEntity)
    private readonly dealCategoryRepository: Repository<DealCategoryEntity>,
  ) {
    super(dealCategoryRepository, 'admin/deals/categories')
  }

  show = showService.bind(this)
}
