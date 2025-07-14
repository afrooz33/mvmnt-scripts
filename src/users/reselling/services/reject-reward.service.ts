import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { AddMemoDto } from '@app/src/users/reselling/dto'
import { ResellingRewardMemoType, ResellingRewardStatus } from '@app/src/users/reselling/enums'

export default async function (payload: AddMemoDto, userId: string): Promise<SuccessRO> {
  try {
    const reward = await this.documentExists({
      condition: [
        {
          where: {
            id: payload.reward,
            cart: {
              seller: {
                id: userId,
              },
            },
            status: ResellingRewardStatus.PENDING,
          },
          relations: [Query.USER],
        },
      ],
      errorMessage: ErrorKey.INVALID_RESELLING_REWARD,
    })

    const memo = await this.resellingRewardMemoRepository.save({
      memo: payload.memo,
      type: ResellingRewardMemoType.REJECT_PAYOUT,
      reward,
      reseller: {
        id: userId,
      },
    })

    //Mark reward as rejected
    reward.status = ResellingRewardStatus.REJECTED

    //Save the updated reward
    await this.resellingRewardRepository.save(reward)

    return {
      success: true,
      message: 'Reward rejected successfully',
      data: memo,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
