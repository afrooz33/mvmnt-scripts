import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { ReinstateResellerDto } from '@app/src/users/reselling/dto'
import { ResellingRewardMemoType } from '@app/src/users/reselling/enums'

export default async function (payload: ReinstateResellerDto, userId: string): Promise<SuccessRO> {
  try {
    const exist = await this.resellingBannedUserRepository.findOne({
      where: {
        seller: {
          id: userId,
        },
        reseller: {
          id: payload.reseller,
        },
      },
      select: ['id'],
    })

    if (!exist) {
      throw new Error(ErrorKey.RESELLER_NOT_BANNED)
    }

    await this.resellingBannedUserRepository.remove(exist)

    await this.resellingRewardMemoRepository.save({
      type: ResellingRewardMemoType.REINSTATE_RESELLER,
      reward: null,
      memo: payload.memo,
      reseller: {
        id: payload.reseller,
      },
    })

    return {
      success: true,
      message: 'Reseller successfully reinstated',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
