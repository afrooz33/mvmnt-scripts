import { In } from 'typeorm'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { BanResellerDto } from '@app/src/users/reselling/dto'
import { AccountStatus, UserAccountType } from '@app/src/users/user/enums'
import { ResellingRewardMemoType, ResellingRewardStatus } from '@app/src/users/reselling/enums'

export default async function (payload: BanResellerDto, userId: string): Promise<SuccessRO> {
  try {
    const seller = await this.userRepository.findOne({
      where: {
        id: userId,
        account_status: AccountStatus.ENABLED,
      },
      select: ['id'],
    })

    if (!seller) {
      throw new Error(ErrorKey.USER_NOT_FOUND)
    }

    const reseller = await this.userRepository.findOne({
      where: {
        id: payload.reseller,
        account_status: AccountStatus.ENABLED,
        account_type: In([UserAccountType.INDIVIDUAL_INFLUENCER]),
      },
      select: ['id'],
    })

    if (!reseller) {
      throw new Error(ErrorKey.USER_NOT_FOUND)
    }

    const exist = await this.resellingBannedUserRepository.findOne({
      where: {
        reseller: {
          id: payload.reseller,
        },
        seller: {
          id: userId,
        },
      },
      select: ['id'],
    })

    if (exist) {
      throw new Error(ErrorKey.RESELLING_USER_ALREADY_BANNED)
    }

    await this.resellingBannedUserRepository.save({
      reseller,
      seller,
    })

    const pendingRewards = await this.resellingRewardRepository.find({
      where: {
        status: ResellingRewardStatus.PENDING,
        user: {
          id: payload.reseller,
        },
      },
      select: ['id'],
    })

    for (const reward of pendingRewards) {
      reward.status = ResellingRewardStatus.REJECTED

      await this.resellingRewardRepository.save(reward)

      await this.resellingRewardMemoRepository.save({
        type: ResellingRewardMemoType.BAN_RESELLER,
        reward,
        memo: payload.memo,
        reseller: {
          id: payload.reseller,
        },
      })

      await this.resellingRewardMemoRepository.save({
        type: ResellingRewardMemoType.REJECT_PAYOUT,
        reward,
        memo: payload.memo,
        reseller: {
          id: payload.reseller,
        },
      })
    }

    return {
      success: true,
      message: 'Reseller successfully banned',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
