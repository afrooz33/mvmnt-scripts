import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { AddMemoDto } from '@app/src/users/reselling/dto'
import { ResellingRewardMemoType } from '@app/src/users/reselling/enums'

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
          },
          select: {
            id: true,
            user: {
              id: true,
            },
          },
          relations: [Query.USER],
        },
      ],
      errorMessage: ErrorKey.INVALID_RESELLING_REWARD,
    })

    const memoExists = await this.resellingRewardMemoRepository.findOne({
      where: {
        reward: {
          id: reward.id,
        },
        type: ResellingRewardMemoType.GENERAL,
      },
    })

    const memo = await this.resellingRewardMemoRepository.save({
      ...memoExists,
      memo: payload.memo,
      type: ResellingRewardMemoType.GENERAL,
      reward: {
        id: reward.id,
      },
      reseller: {
        id: reward.user.id,
      },
    })

    return {
      success: true,
      message: 'Memo successfully added',
      data: memo,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
