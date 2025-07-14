import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MyService } from '@app/src/shared/base'
import { showService } from './services'
import { RecentlyViewedDealEntity } from './entities/recently-viewed.entity'

@Injectable()
export class RecentlyViewedService extends MyService<RecentlyViewedDealEntity> {
  constructor(
    @InjectRepository(RecentlyViewedDealEntity)
    private readonly recentlyViewedDealRepository: Repository<RecentlyViewedDealEntity>,
  ) {
    super(recentlyViewedDealRepository, 'user/deals/recently-viewed', ['user', 'deal'])
  }

  show = showService.bind(this)
}
