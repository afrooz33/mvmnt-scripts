import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { MyService } from '@app/src/shared/base'
import { InjectRepository } from '@nestjs/typeorm'
import { DealShippingFeeTemplateEntity } from './entities/shipping-fee.entity'

@Injectable()
export class TemplateService extends MyService<DealShippingFeeTemplateEntity> {
  constructor(
    @InjectRepository(DealShippingFeeTemplateEntity)
    private readonly templateRepository: Repository<DealShippingFeeTemplateEntity>,
  ) {
    super(templateRepository, 'user/deal/shipping-fee/templates')
  }
}
