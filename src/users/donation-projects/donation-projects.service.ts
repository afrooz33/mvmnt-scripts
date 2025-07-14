import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MyService } from '@app/src/shared/base'
import { DonationProjectEntity } from '@app/src/nonprofit/donation-projects/entities/donation-project.entity'
import { showService, showOneService } from './services'

@Injectable()
export class DonationProjectsService extends MyService<DonationProjectEntity> {
  constructor(
    @InjectRepository(DonationProjectEntity)
    public readonly donationProjectRepository: Repository<DonationProjectEntity>,
  ) {
    super(donationProjectRepository, 'donation-projects')
  }

  show = showService.bind(this)
  showOne = showOneService.bind(this)
}
