import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { MyService } from '@app/src/shared/base'
import { InjectRepository } from '@nestjs/typeorm'
import { DealOptionEntity } from '@app/src/users/deal/entities/deal-option.entity'

@Injectable()
export class VariantOptionService extends MyService<DealOptionEntity> {
  constructor(
    @InjectRepository(DealOptionEntity)
    private readonly variantOptionRepository: Repository<DealOptionEntity>,
  ) {
    super(variantOptionRepository, 'deal/options')
  }
}
