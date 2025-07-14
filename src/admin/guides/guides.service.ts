import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MyService } from '@app/src/shared/base'
import { GuidesEntity } from '@app/src/admin/guides/entities/guides.entity'
import { showService } from './services'

@Injectable()
export class GuidesService extends MyService<GuidesEntity> {
  constructor(
    @InjectRepository(GuidesEntity)
    private readonly guidesRepository: Repository<GuidesEntity>,
  ) {
    super(guidesRepository, 'admin/guides')
  }

  show = showService.bind(this)
}
