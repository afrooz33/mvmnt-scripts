import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MyService } from '@app/src/shared/base'
import { Re2UserEntity } from '@app/src/re2/user/entities/re2-user.entity'
import { UserDonationsEntity } from '@app/src/donations/entities/donations.entity'
import { RecurringDonationSettingsEntity } from '@app/src/recurring-donations/entities/recurring-donation-settings.entity'
import {
  showDonorsService,
  showMonthGroupService,
  showSourceTransactionsService,
  showDonorContributionsService,
  showRecurringDonationsService,
} from './services'

@Injectable()
export class ReceiptService extends MyService<UserDonationsEntity> {
  constructor(
    @InjectRepository(Re2UserEntity)
    private readonly re2UserRepository: Repository<Re2UserEntity>,
    @InjectRepository(UserDonationsEntity)
    private readonly userDonationsRepository: Repository<UserDonationsEntity>,
    @InjectRepository(RecurringDonationSettingsEntity)
    private readonly recurringDonationsRepository: Repository<RecurringDonationSettingsEntity>,
  ) {
    super(userDonationsRepository, 're2/receipts')
  }

  showDonors = showDonorsService.bind(this)
  showMonthGroup = showMonthGroupService.bind(this)
  showSourceTransactions = showSourceTransactionsService.bind(this)
  showDonorContributions = showDonorContributionsService.bind(this)
  showRecurringDonations = showRecurringDonationsService.bind(this)
}
