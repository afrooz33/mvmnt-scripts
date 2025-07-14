import BigNumber from 'bignumber.js'
import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { SuccessRO } from '@app/src/shared/dto'
import { DealType } from '@app/src/users/deal/enums'
import { POINTS_STATUS } from '@app/src/users/points/enums'
import { BrandTokenRequestStatus } from '@app/src/brand-tokens/enums'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { UserPointsEntity } from '@app/src/users/points/entities/user-points.entity'
import { BrandTokenRequestEntity } from '@app/src/brand-tokens/entities/brand-token-request.entity'
import { PaymentWalletsEntity } from '@app/src/users/payment-method/entities/payment-wallets.entity'
import { UserRank } from './enums'
import { RANK_ORDER } from './constant/rank.const'
import { UpdateRanksDto, CheckBTResponseDto } from './dto'
import { UserRankHistoryEntity } from './entities/rank-history'
import {
  calculateRankBalance,
  calculateRankPointsTotal,
  calculateRankPointsFrequency,
} from './helper/calculate-rank.helper'

@Injectable()
export class RankService {
  constructor(
    @InjectRepository(PaymentWalletsEntity)
    private readonly paymentWalletsRepository: Repository<PaymentWalletsEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(UserRankHistoryEntity)
    private readonly userRankHistoryRepository: Repository<UserRankHistoryEntity>,
    @InjectRepository(BrandTokenRequestEntity)
    private readonly brandTokenRequestRepository: Repository<BrandTokenRequestEntity>,
  ) {}

  storePreviousUserRanks = async (): Promise<SuccessRO> => {
    const RANK_PAGE_SIZE = 1000
    for (let loop = 0; ; loop += 1) {
      //  1: Get all User ranks
      const userRanks = await this.userRepository
        .createQueryBuilder('user')
        .select('user.id', 'user')
        .addSelect('user.rank', 'rank')
        .orderBy('user.created', 'ASC')
        .take(RANK_PAGE_SIZE)
        .skip(loop * RANK_PAGE_SIZE)
        .getRawMany()

      if (userRanks.length === 0) break

      //  2: Store in the database
      await this.userRankHistoryRepository.save(userRanks)
    }

    return {
      success: true,
      message: 'Rank history stored',
    }
  }

  updateUserRanks = async (payload: UpdateRanksDto): Promise<SuccessRO> => {
    //  1: Get all wallet address
    const userRanks = {}
    const userAddresses: string[] = payload.values.map((userInfo) => {
      userRanks[userInfo.wallet_address] = calculateRankBalance(BigNumber(userInfo.min_balance))
      return userInfo.wallet_address
    })

    //  2: Get total points and frequency of points for wallets
    const pointDetails = await this.paymentWalletsRepository
      .createQueryBuilder('pw')
      .leftJoin(UserPointsEntity, 'up', 'pw."userId" = up."userId" AND up.status IN (:...status)', {
        status: [POINTS_STATUS.REDEEMED, POINTS_STATUS.DELIVERED, POINTS_STATUS.PARTIALLY_REDEEMED],
      })
      .select('pw.address', 'address')
      .addSelect('pw."userId"', 'user_id')
      .addSelect(
        'COUNT(DISTINCT COALESCE(up."paymentPointsId", up."donationPointsId"))',
        'points_frequency',
      )
      .addSelect('COALESCE(SUM(up.amount), 0)', 'total_points')
      .where('pw.address IN (:...addresses)', { addresses: userAddresses })
      .andWhere('pw."userId" IS NOT NULL')
      .groupBy('pw.address')
      .addGroupBy('pw."userId"')
      .getRawMany()

    //  3: Calculate new rank for each user
    const updates = []
    for (const user of pointDetails) {
      const frequencyRank = calculateRankPointsFrequency(user.points_frequency)
      const totalPointsRank = calculateRankPointsTotal(user.total_points)

      const maxRank = Math.max(
        RANK_ORDER[frequencyRank],
        RANK_ORDER[totalPointsRank],
        RANK_ORDER[userRanks[user.address]],
      )
      const newRank = Object.keys(RANK_ORDER).find(
        (rank) => RANK_ORDER[rank as UserRank] === maxRank,
      ) as UserRank

      updates.push({
        id: user.user_id,
        rank: newRank,
      })
    }

    //  4: Update user ranks
    const rankUpdates = await this.userRepository.save(updates)

    return {
      message: 'Updated ranks successfully',
      success: true,
      data: rankUpdates.length,
    }
  }

  async checkBTEligibility(userId: string): Promise<CheckBTResponseDto> {
    // Get user with deals
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['deals'],
    })

    // Check minimum deals
    const buyNowDealsCount = user.deals
      ? user.deals.filter((deal) => deal.deal_type === DealType.BUYNOW).length
      : 0
    const has_minimum_deals = buyNowDealsCount >= 5

    // Check rank requirement
    const userRank = user.rank
    const has_required_rank = [UserRank.Gold, UserRank.Premium, UserRank.Diamond].includes(userRank)

    // Check verification status
    // TODO: Implement verification status
    const has_completed_verification = true // Adjust based on your verification field

    // Check admin approval
    // add relation user
    const approvalData = await this.brandTokenRequestRepository.findOne({
      where: {
        user: { id: userId },
        status: BrandTokenRequestStatus.APPROVED,
      },
      relations: ['user'],
    })

    const has_admin_approval = approvalData ? true : false

    // Overall eligibility
    const is_eligible =
      has_minimum_deals && has_required_rank && has_completed_verification && has_admin_approval

    return {
      has_minimum_deals,
      has_required_rank,
      has_completed_verification,
      has_admin_approval,
      is_eligible,
    }
  }
}
