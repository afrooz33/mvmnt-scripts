import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MyService } from '@app/src/shared/base'
import { RestrictionsEntity } from './entities/restrictions.entity'

@Injectable()
export class RestrictionsService extends MyService<RestrictionsEntity> {
  constructor(
    @InjectRepository(RestrictionsEntity)
    private readonly restrictionsRepository: Repository<RestrictionsEntity>,
  ) {
    super(restrictionsRepository, 'user/restrictions')
  }
}
