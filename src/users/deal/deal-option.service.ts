import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MyService } from '@app/src/shared/base'
import { DealOptionEntity } from './entities/deal-option.entity'

@Injectable()
export class DealOptionService extends MyService<DealOptionEntity> {
  constructor(
    @InjectRepository(DealOptionEntity)
    private readonly dealOptionService: Repository<DealOptionEntity>,
  ) {
    super(dealOptionService, null)
  }
}
