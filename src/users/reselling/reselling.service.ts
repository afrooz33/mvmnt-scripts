import { nanoid } from 'nanoid'
import { DateTime } from 'luxon'
import { Repository } from 'typeorm'
import BigNumber from 'bignumber.js'
import * as crypto from 'node:crypto'
import { UAParser } from 'ua-parser-js'
import * as requestIp from 'request-ip'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter'
import { Query } from '@app/src/shared/enums'
import { MyService } from '@app/src/shared/base'
import { decodeCookieService } from '@app/src/shared/services'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'
import { UserDealItemPaymentEntity } from '@app/src/users/payment/entities/user-deal-item-payment.entity'
import { ResellingLinkEntity } from './entities/reselling.entity'
import { ResellingEventType, ResellingRewardStatus } from './enums'
import { ResellingRewardService } from './reselling-reward.service'
import { ResellingEventEntity } from './entities/reselling-event.entity'
import { ResellingRewardEntity } from './entities/reselling-reward.entity'
import { ResellingBannedUserEntity } from './entities/reselling-banned-user.entity'
import {
  showService,
  createService,
  verifyService,
  getOverallStatsService,
  validateAndCreateService,
  getConversionRateService,
} from './services'

@Injectable()
export class ResellingService extends MyService<ResellingLinkEntity> {
  constructor(
    @InjectRepository(ResellingLinkEntity)
    private readonly resellingLinkRepository: Repository<ResellingLinkEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(DealEntity)
    private readonly dealRepository: Repository<DealEntity>,
    @InjectRepository(ResellingEventEntity)
    private readonly resellingEventRepository: Repository<ResellingEventEntity>,
    @InjectRepository(ResellingRewardEntity)
    private readonly resellingRewardRepository: Repository<ResellingRewardEntity>,
    @InjectRepository(UserDealItemPaymentEntity)
    private readonly userDealItemPaymentRepository: Repository<UserDealItemPaymentEntity>,
    private readonly eventEmitter: EventEmitter2,
    private readonly configService: ConfigService,
    @InjectRepository(ResellingBannedUserEntity)
    private readonly resellingBannedUserRepository: Repository<ResellingBannedUserEntity>,
    private readonly resellingRewardService: ResellingRewardService, // Inject Reward Service
  ) {
    super(resellingLinkRepository, 'users/reselling')
  }

  show = showService.bind(this)
  create = createService.bind(this)
  verify = verifyService.bind(this)
  validateAndCreate = validateAndCreateService.bind(this)

  private generateUniqueToken(userId: string, dealId: string): string {
    const hash = crypto.createHash('sha256')
    hash.update(userId + dealId + Date.now().toString())
    return hash.digest('hex')
  }

  async generateUniqueShortUrlCode(): Promise<string> {
    let isUnique = false
    let shortCode = ''

    while (!isUnique) {
      shortCode = nanoid(8)

      const existingLink = await this.resellingLinkRepository.findOne({
        where: { short_token: shortCode },
        select: ['id'],
      })

      if (!existingLink) {
        isUnique = true
      }
    }

    return shortCode
  }

  async findByToken(token: string): Promise<ResellingLinkEntity> {
    return await this.resellingLinkRepository.findOne({
      where: { token },
      select: ['id'],
    })
  }

  getOverallStats = getOverallStatsService.bind(this)
  getConversionRate = getConversionRateService.bind(this)

  @OnEvent('reselling.event.track')
  async handleResellingEvent(payload: any): Promise<void> {
    try {
      // Use destructured IDs from payload consistently
      const { type, user_id, deal_id, payment_item_id, reselling_link_id, req } = payload

      let resellingLink: ResellingLinkEntity | null = null
      let eventUser: UserEntity | null = null
      let eventDeal: DealEntity | null = null
      let deviceInfo = null
      let referrer = ''
      const isPurchaseEvent = type === ResellingEventType.PURCHASE

      // Fetch link based on ID if available (purchase event)
      if (reselling_link_id) {
        resellingLink = await this.resellingLinkRepository.findOne({
          where: { id: reselling_link_id },
          relations: [Query.USER, Query.DEAL, Query.DEAL_USER],
        })
      }
      // Fetch link based on cookie/deal if req available (non-purchase events)
      else if (req && deal_id) {
        let resellingDeals: any = await decodeCookieService(req, 'x-reselling-deals')
        resellingDeals = resellingDeals ? JSON.parse(resellingDeals) : null
        const resellingInfo = resellingDeals ? resellingDeals[deal_id] : null

        if (resellingInfo) {
          resellingLink = await this.resellingLinkRepository.findOne({
            where: { id: resellingInfo.resellingLinkId },
            relations: [Query.USER, Query.DEAL, Query.DEAL_USER],
          })
        }
      }

      if (!resellingLink) {
        return
      }

      // Prevent tracking self-clicks/views
      if (!isPurchaseEvent && user_id && resellingLink.user.id === user_id) {
        return
      }

      // Fetch user/deal entities if IDs provided
      if (user_id) {
        eventUser = await this.userRepository.findOneBy({ id: user_id })
      }
      if (deal_id) {
        eventDeal = await this.dealRepository.findOneBy({ id: deal_id })
      }

      const isBanned = !!(await this.resellingBannedUserRepository.findOne({
        where: {
          reseller: { id: resellingLink.user.id },
          seller: { id: resellingLink.deal?.user?.id },
        },
        select: ['id'],
      }))

      // Get device info only if req is present
      if (req) {
        const ip = requestIp.getClientIp(req)
        referrer = req.headers.referer || ''
        const uaParser = new UAParser(req.headers['user-agent'])
        const uaResult = uaParser.getResult()
        deviceInfo = {
          userAgent: req.headers['user-agent'] || 'Unknown UA',
          ip: ip || 'Unknown IP',
          platform: uaResult.os.name || 'Unknown OS',
          browser: uaResult.browser.name || 'Unknown Browser',
          deviceType: uaResult.device.type || 'Desktop',
        }
      }

      // Create the event record
      const event = this.resellingEventRepository.create({
        type,
        deal: eventDeal ? { id: eventDeal.id } : null,
        user: eventUser ? { id: eventUser.id } : null,
        reselling_link: { id: resellingLink.id },
        device_info: deviceInfo,
        referrer: referrer,
        reseller_banned: isBanned,
      })
      const savedEvent = await this.resellingEventRepository.save(event)

      // Process purchase event: calculate and create reward
      if (isPurchaseEvent && payment_item_id && !isBanned) {
        const paymentItem = await this.userDealItemPaymentRepository.findOne({
          where: { id: payment_item_id },
          relations: [
            'deal',
            'deal.user',
            'deal_variant',
            'sender',
            'payment',
            'payment.cart',
            'reselling_link',
            'reselling_link.user',
          ],
        })

        if (
          !paymentItem ||
          !paymentItem.reselling_link ||
          paymentItem.reselling_link.id !== resellingLink.id
        ) {
          return
        }

        const { rewardAmount, allowedAmount } =
          await this.resellingRewardService.calculateRewardForPurchase(paymentItem)

        if (rewardAmount > 0) {
          const scheduledDate = DateTime.now().plus({ days: 15 }).toJSDate()

          const reward = this.resellingRewardRepository.create({
            user: { id: resellingLink.user.id },
            deal: { id: paymentItem.deal.id },
            cart: { id: paymentItem.payment.cart.id },
            cart_item: { id: paymentItem.id },
            event: savedEvent,
            purchase_amount: new BigNumber(allowedAmount),
            reward_value: new BigNumber(rewardAmount),
            status: ResellingRewardStatus.PENDING,
            scheduled_acquisition_date: scheduledDate,
          })

          await this.resellingRewardRepository.save(reward)
        }
      }
    } catch (error) {
      console.error('Error handling reselling event:', error)
    }
  }
}
