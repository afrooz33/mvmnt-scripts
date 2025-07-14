import { Repository } from 'typeorm'
import { OnEvent } from '@nestjs/event-emitter'
import { MyService } from '@app/src/shared/base'
import { InjectRepository } from '@nestjs/typeorm'
import { BadRequestException, Injectable } from '@nestjs/common'
import { UserService } from '@app/src/users/user/user.service'
import { ContributionStarsEventPayload } from '@app/src/users/stars/interfaces'
import {
  DealStarsService,
  DonationStarsService,
  ContributionStarsService,
  awardContributionStarsService,
} from './services'
import { StarType, StarActionType } from './enums'
import { CONTRIBUTION_STAR_AMOUNT } from './constants'
import { UserStarsEntity } from './entities/stars.entity'

@Injectable()
export class StarsService extends MyService<UserStarsEntity> {
  constructor(
    @InjectRepository(UserStarsEntity)
    private readonly userStarsRepository: Repository<UserStarsEntity>,
    private readonly dealStarsService: DealStarsService,
    private readonly donationStarsService: DonationStarsService,
    private readonly contributionStarsService: ContributionStarsService,
    private readonly userService: UserService,
  ) {
    super(userStarsRepository, 'users/stars')
  }

  addDealStars = this.dealStarsService.addDealStars
  addDonationStars = this.donationStarsService.addDonationStars
  addContributionStars = this.contributionStarsService.addContributionStars

  /**
   * Calculate the number of stars for a transaction and donation
   * @param amount the transaction/donation amount in fiat currency
   * @abstract 1 fiat currency = 1 star
   * @returns the number of stars
   */
  async calculateTransactionStars(amount: number): Promise<number> {
    return amount
  }

  /**
   * Calculates the number of contribution stars for a given action type.
   * The mapping is as follows:
   * - ORDER_CREATED: 50
   * - RESALE_ORDER: 50
   * - DIRECT_DONATION: 50
   * - RE2_DONATION: 50
   * - FRIEND_INVITE: 20
   * - INVITED_PURCHASE: 15
   * - INVITED_SALE: 15
   * - INVITED_DONATION: 15
   * - SHARE_DEAL: 10
   * - SHARE_NONPROFIT: 10
   * - SHARE_FUNDRAISER: 10
   * @param action the action type
   * @returns the number of contribution stars
   */
  async calculateContributionStars(action: StarActionType): Promise<number> {
    const contributionType = CONTRIBUTION_STAR_AMOUNT[action]

    if (!contributionType) {
      throw new BadRequestException(`Action type ${action} is not mapped to a contribution type.`)
    }

    return contributionType
  }

  /**
   * Get the total number of stars for a user, either for a specific star type or total
   * @param userId the user ID
   * @param type the star type to filter by (optional)
   * @returns the total number of stars
   */
  async getUserTotalStars(userId: string, type?: StarType): Promise<number> {
    const query = this.userStarsRepository
      .createQueryBuilder('user_stars')
      .where('"user_stars"."userId" = :userId', { userId })

    if (type) {
      query.andWhere('"user_stars"."type" = :star_type', { star_type: type })
    }

    const result = await query.select('COALESCE(SUM("user_stars"."stars"), 0)', 'total').getRawOne()

    return Number.parseInt(result.total)
  }

  @OnEvent('user.award.contribution.stars')
  async awardContributionStars(eventPayload: ContributionStarsEventPayload): Promise<void> {
    await awardContributionStarsService.call(this, eventPayload)
  }
}
