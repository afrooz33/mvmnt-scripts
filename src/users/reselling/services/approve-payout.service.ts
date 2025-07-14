import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { ApprovePayoutDto } from '@app/src/users/reselling/dto'
import { ResellingRewardMemoType, ResellingRewardStatus } from '@app/src/users/reselling/enums'

export default async function (payload: ApprovePayoutDto, userId: string): Promise<SuccessRO> {
  try {
    const reward = await this.documentExists({
      condition: [
        {
          where: {
            id: payload.reward,
            user: {
              id: payload.reseller,
            },
            deal: {
              user: {
                id: userId,
              },
            },
            status: ResellingRewardStatus.REJECTED,
          },
          select: ['id', 'scheduled_acquisition_date'],
        },
      ],
      errorMessage: ErrorKey.INVALID_RESELLING_REWARD,
    })

    const date = new Date(reward.scheduled_acquisition_date)

    if (date < new Date()) {
      throw new Error(ErrorKey.REWARD_EXPIRED)
    }

    reward.status = ResellingRewardStatus.PENDING

    await this.resellingRewardRepository.save(reward)

    await this.resellingRewardMemoRepository.save({
      type: ResellingRewardMemoType.REINSTATE_PAYOUT,
      reward: {
        id: reward.id,
      },
      memo: payload.memo,
      reseller: {
        id: payload.reseller,
      },
    })

    return {
      success: true,
      message: 'Reward successfully approved',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
