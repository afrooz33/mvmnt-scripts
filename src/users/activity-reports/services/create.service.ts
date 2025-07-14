import { In } from 'typeorm'
import { BadRequestException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { AccountStatus } from '@app/src/users/user/enums'
import { CreateActivityReportsDto } from '@app/src/users/activity-reports/dto'

export default async function (
  payload: CreateActivityReportsDto,
  userId: string,
): Promise<SuccessRO> {
  try {
    const user = await this.userService.findOne({
      where: {
        id: userId,
        account_status: AccountStatus.ENABLED,
      },
      relations: [Query.NONPROFIT],
      select: ['id', 'nonprofit.id'],
    })

    if (!user || !user.nonprofit?.id) {
      throw new BadRequestException(ErrorKey.USER_NOT_NONPROFIT)
    }

    const assets = await this.assetsService.assetsRepository.find({
      where: {
        id: In(payload.assets),
      },
      select: ['id'],
    })

    if (assets.length !== payload.assets.length) {
      throw new BadRequestException(ErrorKey.MISSING_REPORT_ASSETS)
    }

    const report = await this.updateOne({
      ...payload,
      user: {
        id: user.id,
      },
      assets,
    })

    return {
      success: true,
      message: `Activity report successfully created`,
      data: report,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
