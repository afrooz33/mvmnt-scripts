import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MyService } from '@app/src/shared/base'
import { NonprofitUserService } from '@app/src/nonprofit/user/nonprofit-user.service'
import { NonprofitProfileService } from '@app/src/nonprofit/profile/nonprofit-profile.service'
import { HistoryService } from '@app/src/admin/donation-projects/history/history.service'
import { NonprofitProfileEntity } from '@app/src/nonprofit/profile/entities/nonprofit-profile.entity'
import {
  showService,
  showOneService,
  profileReviewService,
  donationSourceService,
  changeAccountStatusService,
} from './services'
import { UserDonationsEntity } from '@app/src/donations/entities/donations.entity'
import { DonationProjectEntity } from '@app/src/nonprofit/donation-projects/entities/donation-project.entity'
import { SmartContractService } from '@app/src/blockchain/smart-contract.service'
import { PaymentWalletsService } from '@app/src/users/payment-method/services'

@Injectable()
export class NonprofitService extends MyService<NonprofitProfileEntity> {
  constructor(
    @InjectRepository(NonprofitProfileEntity)
    public adminNonprofitRepository: Repository<NonprofitProfileEntity>,
    private readonly nonprofitProfileService: NonprofitProfileService,
    private readonly nonprofitUserService: NonprofitUserService,
    private readonly historyService: HistoryService,
    private readonly smartContractService: SmartContractService,
    private readonly paymentWalletsService: PaymentWalletsService,
    @InjectRepository(UserDonationsEntity)
    private readonly donationRepository: Repository<UserDonationsEntity>,
    @InjectRepository(DonationProjectEntity)
    public readonly donationProjectRepository: Repository<DonationProjectEntity>,
  ) {
    super(adminNonprofitRepository, 'admin/nonprofit')
  }

  show = showService.bind(this)
  showOne = showOneService.bind(this)
  profileReview = profileReviewService.bind(this)
  donationSource = donationSourceService.bind(this)
  changeAccountStatus = changeAccountStatusService.bind(this)
}
