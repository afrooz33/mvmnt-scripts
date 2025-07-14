import { Injectable } from '@nestjs/common'
import { ContributionStarType, StarActionType, StarType } from '@app/src/users/stars/enums'
import { CONTRIBUTION_STAR_AMOUNT } from '@app/src/users/stars/constants/contribution-amount.const'
import { UserStarsEntity } from '@app/src/users/stars/entities/stars.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

@Injectable()
export class ContributionStarsService {
  constructor(
    @InjectRepository(UserStarsEntity)
    private readonly starsRepository: Repository<UserStarsEntity>,
  ) {}

  async addContributionStars(userId: string, type: ContributionStarType, action: StarActionType) {
    const contributionStar = this.createContributionStar(userId, type, action)
    await this.starsRepository.save(contributionStar)
  }

  private getContributionAmount(type: ContributionStarType): number {
    return CONTRIBUTION_STAR_AMOUNT[type]
  }

  createContributionStar(
    userId: string,
    type: ContributionStarType,
    actionType: StarActionType,
    dealPaymentId?: string,
    donationPaymentId?: string,
  ): UserStarsEntity {
    return this.starsRepository.create({
      user: {
        id: userId,
      },
      type: StarType.CONTRIBUTION,
      contribution_star_type: type,
      stars: this.getContributionAmount(type),
      deal_payment: {
        id: dealPaymentId,
      },
      action: actionType,
      donation_payment: {
        id: donationPaymentId,
      },
    })
  }
}
