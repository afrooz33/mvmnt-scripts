import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { MyService } from '@app/src/shared/base'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'
import { ReportEntity } from './entities/report.entity'
import { createService } from './services'

@Injectable()
export class ReportService extends MyService<ReportEntity> {
  constructor(
    @InjectRepository(ReportEntity)
    private readonly reportRepository: Repository<ReportEntity>,
    @InjectRepository(DealEntity)
    private readonly dealRepository: Repository<DealEntity>,
    private readonly entityManager: EntityManager,
  ) {
    super(reportRepository, 'reports/deal')
  }

  create = createService.bind(this)
}
