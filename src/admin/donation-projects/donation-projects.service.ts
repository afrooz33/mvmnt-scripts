import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MyService } from '@app/src/shared/base'
import { UserDonationsEntity } from '@app/src/donations/entities/donations.entity'
import { DonationProjectEntity } from '@app/src/nonprofit/donation-projects/entities/donation-project.entity'
import {
  showService,
  listService,
  toCSVService,
  reviewService,
  donationSourceService,
  donationSourceDonorService,
  toCSVDonationSourceDonorService,
} from './services'
import { SmartContractService } from '@app/src/blockchain/smart-contract.service'
import { PaymentWalletsService } from '@app/src/users/payment-method/services'

@Injectable()
export class DonationProjectsService extends MyService<DonationProjectEntity> {
  constructor(
    @InjectRepository(DonationProjectEntity)
    public readonly donationProjectRepository: Repository<DonationProjectEntity>,
    @InjectRepository(UserDonationsEntity)
    public readonly donationRepository: Repository<UserDonationsEntity>,
    private readonly smartContractService: SmartContractService,
    private readonly paymentWalletsService: PaymentWalletsService,
  ) {
    super(donationProjectRepository, 'admin/donation-projects')
  }

  private toCSV = toCSVService.bind(this)
  private toCSVDonationSourceDonor = toCSVDonationSourceDonorService.bind(this)

  show = showService.bind(this)
  list = listService.bind(this)
  review = reviewService.bind(this)
  donationSource = donationSourceService.bind(this)
  donationSourceDonor = donationSourceDonorService.bind(this)
}
