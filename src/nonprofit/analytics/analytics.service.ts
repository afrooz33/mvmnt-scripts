import { EntityManager, Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MyService } from '@app/src/shared/base'
import { UserDonationsEntity } from '@app/src/donations/entities/donations.entity'
import { UserDonationPaymentEntity } from '@app/src/users/payment/entities/user-donation-payment.entity'
import {
  showService,
  re2RankingService,
  dealRankingService,
  userRankingService,
  totalDonationService,
  genderDonatorService,
  ageGenderDonatorService,
  toCsvDonorRankingService,
  exportUserRankingService,
  exportDealRankingService,
  toCsvGenderDonatorService,
  toCsvAgeGenderDonatorService,
  totalDonationCategoryService,
  donationProjectRankingService,
  toCsvNonprofitDealRankingService,
  toCsvDonationProjectRankingService,
} from './services'

@Injectable()
export class AnalyticsService extends MyService<UserDonationsEntity> {
  constructor(
    @InjectRepository(UserDonationsEntity)
    private readonly donationsRepository: Repository<UserDonationsEntity>,
    @InjectRepository(UserDonationPaymentEntity)
    private readonly donationPaymentRepository: Repository<UserDonationPaymentEntity>,
    private readonly entityManager: EntityManager,
  ) {
    super(donationsRepository, 'analytics')
  }

  show = showService.bind(this)
  re2Ranking = re2RankingService.bind(this)
  dealRanking = dealRankingService.bind(this)
  userRanking = userRankingService.bind(this)
  totalDonation = totalDonationService.bind(this)
  genderDonator = genderDonatorService.bind(this)
  ageGenderDonator = ageGenderDonatorService.bind(this)
  toCsvDonorRanking = toCsvDonorRankingService.bind(this)
  exportUserRanking = exportUserRankingService.bind(this)
  exportDealRanking = exportDealRankingService.bind(this)
  toCsvGenderDonator = toCsvGenderDonatorService.bind(this)
  toCsvAgeGenderDonator = toCsvAgeGenderDonatorService.bind(this)
  totalDonationCategory = totalDonationCategoryService.bind(this)
  donationProjectRanking = donationProjectRankingService.bind(this)
  toCsvNonprofitDealRanking = toCsvNonprofitDealRankingService.bind(this)
  toCsvDonationProjectRanking = toCsvDonationProjectRankingService.bind(this)
}
