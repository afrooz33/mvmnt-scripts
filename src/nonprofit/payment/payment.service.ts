import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { MyService } from '@app/src/shared/base'
import { UserDonationsEntity } from '@app/src/donations/entities/donations.entity'
import { showService, topStatsService } from './services'

export class PaymentService extends MyService<UserDonationsEntity> {
  constructor(
    @InjectRepository(UserDonationsEntity)
    private readonly donationsRepository: Repository<UserDonationsEntity>,
  ) {
    super(donationsRepository, 'nonprofit/payments')
  }

  show = showService.bind(this)
  topStats = topStatsService.bind(this)
}
