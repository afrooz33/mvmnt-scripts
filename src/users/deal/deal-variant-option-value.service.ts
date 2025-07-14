import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MyService } from '@app/src/shared/base'
import { DealOptionValueEntity } from './entities/deal-option-value.entity'

@Injectable()
export class DealVariantOptionValueService extends MyService<DealOptionValueEntity> {
  constructor(
    @InjectRepository(DealOptionValueEntity)
    private readonly dealVariantOptionValueRepository: Repository<DealOptionValueEntity>,
  ) {
    super(dealVariantOptionValueRepository, 'deals/variant/options/values')
  }
}
