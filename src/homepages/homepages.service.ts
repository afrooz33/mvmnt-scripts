import { EntityManager, Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MyService } from '@app/src/shared/base'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { UserDonationsEntity } from '@app/src/donations/entities/donations.entity'
import { HomepagesEntity } from '@app/src/admin/homepages/entities/homepages.entity'
import { HomepageContentEntity } from '@app/src/admin/homepages/entities/homepage-content.entity'
import { RecentlyViewedDealEntity } from '@app/src/users/deal/recently-viewed/entities/recently-viewed.entity'
import {
  showService,
  showOneService,
  dealListService,
  userListService,
  customListService,
  viewHistoryService,
  listPopularService,
  trendingDealsService,
  businessRankingService,
  influencerRankingService,
} from './services'

@Injectable()
export class HomepagesService extends MyService<HomepagesEntity> {
  constructor(
    @InjectRepository(HomepagesEntity)
    private readonly homepageRepository: Repository<HomepagesEntity>,
    @InjectRepository(HomepageContentEntity)
    private readonly homepageContentRepository: Repository<HomepageContentEntity>,
    @InjectRepository(DealEntity)
    private readonly dealRepository: Repository<DealEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(RecentlyViewedDealEntity)
    private readonly recentlyViewedRepository: Repository<RecentlyViewedDealEntity>,
    @InjectRepository(UserDonationsEntity)
    private readonly donationsRepository: Repository<UserDonationsEntity>,
    private readonly entityManager: EntityManager,
  ) {
    super(homepageRepository, 'homepages')
  }

  show = showService.bind(this)
  showOne = showOneService.bind(this)

  /**
   * functions to get Homepage content
   * @param homepage - HomepagesEntity
   * @param query
   * @returns PaginateRO
   * @description
   * Get homepages content by homepage type and id
   */
  dealList = dealListService.bind(this)
  userList = userListService.bind(this)
  customList = customListService.bind(this)
  viewHistory = viewHistoryService.bind(this)
  listPopular = listPopularService.bind(this)
  trendingDeals = trendingDealsService.bind(this)
  businessRanking = businessRankingService.bind(this)
  influencerRanking = influencerRankingService.bind(this)
}
