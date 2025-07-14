import { Repository, Not } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { Injectable } from '@nestjs/common'
import { MyService } from '@app/src/shared/base'
import { HistoryEntity } from '@app/src/admin/donation-projects/history/entities/history.entity'
import { DonationProjectsService } from '@app/src/nonprofit/donation-projects/donation-projects.service'
import { activateService, deactivateService } from './services'
import { DonationProjectEntity } from '@app/src/nonprofit/donation-projects/entities/donation-project.entity'
import { DonationProjectStatus } from '@app/src/nonprofit/donation-projects/enums'

@Injectable()
export class HistoryService extends MyService<HistoryEntity> {
  constructor(
    @InjectRepository(HistoryEntity)
    public historyRepository: Repository<HistoryEntity>,
    private readonly donationProjectService: DonationProjectsService,
  ) {
    super(historyRepository, 'admin/donation-projects/history')
  }

  public async getDonationProjects(userId: string): Promise<DonationProjectEntity[]> {
    return await this.donationProjectService.findMany({
      where: {
        user: {
          id: userId,
        },
        status: Not(DonationProjectStatus.ENDED),
      },
    })
  }

  activate = activateService.bind(this)
  deactivate = deactivateService.bind(this)
}
