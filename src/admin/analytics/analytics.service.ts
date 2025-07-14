import { Injectable } from '@nestjs/common'
import { EntityManager, Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { MyService } from '@app/src/shared/base'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { UserDonationsEntity } from '@app/src/donations/entities/donations.entity'
import { NonprofitUserEntity } from '@app/src/nonprofit/user/entities/nonprofit-user.entity'
import { WalletBalanceEntity } from '@app/src/transaction-processor/entities/wallet-balance.entity'
import {
  topStatsService,
  totalSalesService,
  dealRankingService,
  loginActivityService,
  sellerRankingService,
  genderDonatorService,
  chartTotalUserService,
  dealTypeRankingService,
  categoryRankingService,
  nonprofitRankingService,
  ageGenderDonatorService,
  totalParticipantService,
  re2TotalDonationService,
  fundraiserRankingService,
  totalOpenCloseDealService,
  userHoldingRankingService,
  totalMvmntDonationService,
  integrationShopifyService,
  registrationActivityService,
  shopifyTotalDonationService,
  fundraiserTotalDonationService,
  integrationTotalDonationService,
  categoryDonationParticipantService,
  integrationFundraiserRankingService,
} from './services'

@Injectable()
export class AnalyticsService extends MyService<UserDonationsEntity> {
  constructor(
    @InjectRepository(UserDonationsEntity)
    private readonly donationsRepository: Repository<UserDonationsEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(NonprofitUserEntity)
    private readonly nonprofitUserRepository: Repository<NonprofitUserEntity>,
    @InjectRepository(WalletBalanceEntity)
    private readonly walletBalanceRepository: Repository<WalletBalanceEntity>,
    private readonly entityManager: EntityManager,
  ) {
    super(donationsRepository, 'admin/analytics')
  }

  topStats = topStatsService.bind(this)
  totalSales = totalSalesService.bind(this)
  dealRanking = dealRankingService.bind(this)
  sellerRanking = sellerRankingService.bind(this)
  loginActivity = loginActivityService.bind(this)
  genderDonator = genderDonatorService.bind(this)
  chartTotalUser = chartTotalUserService.bind(this)
  dealTypeRanking = dealTypeRankingService.bind(this)
  categoryRanking = categoryRankingService.bind(this)
  nonprofitRanking = nonprofitRankingService.bind(this)
  ageGenderDonator = ageGenderDonatorService.bind(this)
  re2TotalDonation = re2TotalDonationService.bind(this)
  totalParticipant = totalParticipantService.bind(this)
  fundraiserRanking = fundraiserRankingService.bind(this)
  totalOpenCloseDeal = totalOpenCloseDealService.bind(this)
  userHoldingRanking = userHoldingRankingService.bind(this)
  integrationShopify = integrationShopifyService.bind(this)
  totalMvmntDonation = totalMvmntDonationService.bind(this)
  registrationActivity = registrationActivityService.bind(this)
  shopifyTotalDonation = shopifyTotalDonationService.bind(this)
  fundraiserTotalDonation = fundraiserTotalDonationService.bind(this)
  integrationTotalDonation = integrationTotalDonationService.bind(this)
  categoryDonationParticipant = categoryDonationParticipantService.bind(this)
  integrationFundraiserRanking = integrationFundraiserRankingService.bind(this)
}
