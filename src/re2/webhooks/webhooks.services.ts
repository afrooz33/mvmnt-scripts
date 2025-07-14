import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { UserService } from '@app/src/users/user/user.service'
import { UserDonationsService } from '@app/src/donations/user-donations.service'
import { NonprofitUserEntity } from '@app/src/nonprofit/user/entities/nonprofit-user.entity'
import { DonationProjectEntity } from '@app/src/nonprofit/donation-projects/entities/donation-project.entity'
import { UserPointsService } from '@app/src/users/points/user-points.service'
import { processOrderService } from './services'
import { ShopifyOrderEntity } from './entities/shopify-order.entity'

@Injectable()
export class WebhooksServices {
  constructor(
    @InjectRepository(ShopifyOrderEntity)
    private readonly shopifyOrderRepository: Repository<ShopifyOrderEntity>,
    @InjectRepository(NonprofitUserEntity)
    private readonly nonprofitUserRepository: Repository<NonprofitUserEntity>,
    @InjectRepository(DonationProjectEntity)
    private readonly donationProjectRepository: Repository<DonationProjectEntity>,
    private readonly userService: UserService,
    private readonly userPointsService: UserPointsService,
    private readonly userDonationsService: UserDonationsService,
  ) {}

  /**
   * processOrder
   * @param body
   * @returns SuccessRO
   * @description Save shopify order and create temp user if not exist
   */
  processOrder = processOrderService.bind(this)
}
