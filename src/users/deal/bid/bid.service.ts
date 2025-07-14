import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MyService } from '@app/src/shared/base'
import { DealService } from '@app/src/users/deal/deal.service'
import { UserService } from '@app/src/users/user/user.service'
import { DonationsService } from '@app/src/donations/donations.service'
import { UserPointsService } from '@app/src/users/points/user-points.service'
import { SystemFeeService } from '@app/src/admin/system-fee/system-fee.service'
import { NotificationsService } from '@app/src/notifications/notifications.service'
import { RegionSettingsService } from '@app/src/admin/region-settings/region_settings.service'
import { BidEntity } from './entities/bid.entity'
import {
  showService,
  awardService,
  createService,
  bidderService,
  rejectService,
  declineService,
  showWinnerService,
} from './services'

@Injectable()
export class BidService extends MyService<BidEntity> {
  constructor(
    @InjectRepository(BidEntity)
    private readonly bidRepository: Repository<BidEntity>,
    private readonly dealService: DealService,
    private readonly userService: UserService,
    private readonly notificationsService: NotificationsService,
    private readonly systemFeeService: SystemFeeService,
    private readonly donationsService: DonationsService,
    private readonly regionSettingsService: RegionSettingsService,
    private readonly userPointsService: UserPointsService,
  ) {
    super(bidRepository, 'user/deal/bids')
  }

  show = showService.bind(this)
  award = awardService.bind(this)
  create = createService.bind(this)
  reject = rejectService.bind(this)
  bidder = bidderService.bind(this)
  decline = declineService.bind(this)
  showWinner = showWinnerService.bind(this)
}
