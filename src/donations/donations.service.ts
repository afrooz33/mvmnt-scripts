import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { MyService } from '@app/src/shared/base'
import { UserService } from '@app/src/users/user/user.service'
import { SystemFeeService } from '@app/src/admin/system-fee/system-fee.service'
import { NonprofitUserService } from '@app/src/nonprofit/user/nonprofit-user.service'
import { RegionSettingsService } from '@app/src/admin/region-settings/region_settings.service'
import { RecurringDonationsService } from '@app/src/recurring-donations/recurring-donations.service'
import { DonationProjectsService } from '@app/src/nonprofit/donation-projects/donation-projects.service'
import { UserDonationsEntity } from './entities/donations.entity'
import {
  showService,
  chartStatsService,
  profileStatsService,
  donationStatsService,
  cancelRecurringService,
  pendingDonationsService,
  userDonationStatsService,
  subscriptionDeleteService,
  invoicePaymentFailedService,
  invoicePaymentSucceededService,
} from './services'

@Injectable()
export class DonationsService extends MyService<UserDonationsEntity> {
  constructor(
    @InjectRepository(UserDonationsEntity)
    private readonly donationsRepository: Repository<UserDonationsEntity>,
    private configService: ConfigService,
    private readonly userService: UserService,
    private readonly nonprofitUserService: NonprofitUserService,
    private readonly donationProjectService: DonationProjectsService,
    private readonly systemFeeService: SystemFeeService,
    private readonly entityManager: EntityManager,
    private readonly regionSettingsService: RegionSettingsService,
    private readonly eventEmitter: EventEmitter2,
    private readonly recurringDonationsService: RecurringDonationsService,
  ) {
    super(donationsRepository, 'user/donations')
  }

  show = showService.bind(this)
  chartStats = chartStatsService.bind(this)
  profileStats = profileStatsService.bind(this)
  donationStats = donationStatsService.bind(this)
  cancelRecurring = cancelRecurringService.bind(this)
  pendingDonations = pendingDonationsService.bind(this)
  userDonationStats = userDonationStatsService.bind(this)
  subscriptionDelete = subscriptionDeleteService.bind(this)
  invoicePaymentFailed = invoicePaymentFailedService.bind(this)
  invoicePaymentSucceeded = invoicePaymentSucceededService.bind(this)
}
