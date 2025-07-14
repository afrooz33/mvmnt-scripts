import { PreconditionFailedException } from '@nestjs/common'
import { NonprofitProfileEntity } from '@app/src/nonprofit/profile/entities/nonprofit-profile.entity'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { SuccessRO } from '@app/src/shared/dto'
import { NonprofitUserEntity } from '@app/src/nonprofit/user/entities/nonprofit-user.entity'
import { AccountStatus } from '@app/src/nonprofit/user/enums'
import { ActionParamDto } from '@app/src/admin/nonprofit/dto/action-params.dto'

export default async function (payload: ActionParamDto): Promise<SuccessRO> {
  const profile: NonprofitProfileEntity = await this.documentExists({
    condition: [
      {
        relations: [Query.USER],
        where: {
          id: payload.id,
        },
      },
    ],
    message: ErrorKey.PROFILE_NOT_FOUND,
  })

  if (profile.user?.account_status === AccountStatus.DELETED) {
    throw new PreconditionFailedException('User is deleted')
  }

  /**
   * Save history
   *
   * Dynamically call the method based on the payload.status
   * Expected value: active or deactivated
   *
   * ACTIVE => call this.historyService.activateService()
   * DEACTIVATED => call this.historyService.deactivateService()
   */

  const methodName =
    payload.status.toString().toLowerCase() === String(AccountStatus.ACTIVE).toLowerCase()
      ? 'activate'
      : 'deactivate'

  await this.historyService[methodName](profile.user.id)

  const updatedUser: NonprofitUserEntity = await this.nonprofitUserService.updateOne(
    {
      ...profile.user,
      account_status: payload.status,
    },
    {
      where: {
        id: profile.user.id,
      },
      errorKey: ErrorKey.USER_NOT_FOUND,
    },
  )

  return {
    success: true,
    message: 'User status successfully saved',
    data: updatedUser.toResponseObject(),
  }
}
