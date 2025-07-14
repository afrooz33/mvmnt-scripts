import { In } from 'typeorm'
import { PreconditionFailedException } from '@nestjs/common'
import { ErrorKey } from '@app/src/shared/enums'
import { DeleteRecordDto, SuccessRO } from '@app/src/shared/dto'
import { DealStatus } from '@app/src/users/deal/enums'
import { AccountStatus } from '@app/src/users/user/enums'
import { UserEntity } from '@app/src/users/user/entities/user.entity'

export default async function (payload: DeleteRecordDto, userId: string): Promise<SuccessRO> {
  const user: UserEntity = await this.userService.documentExists({
    condition: [
      {
        where: {
          id: userId,
          account_status: AccountStatus.ENABLED,
        },
        select: ['id', 'account_status', 'account_type'],
      },
    ],
    errorMessage: ErrorKey.USER_NOT_FOUND,
  })

  const deal = await this.dealRepository.find({
    where: {
      id: In(payload.ids),
      user: {
        id: user.id,
      },
      status: DealStatus.DRAFT,
    },
    select: ['id', 'deal_type', 'status', 'name'],
  })

  if (deal.length < payload.ids.length) {
    throw new PreconditionFailedException(ErrorKey.DEAL_NOT_FOUND)
  }

  await this.dealRepository.update(
    {
      id: In(payload.ids),
    },
    {
      status: DealStatus.DELETED,
    },
  )

  return {
    message: 'Multiple deal deleted successfully',
    success: true,
  }
}
