import { Not } from 'typeorm'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { AdminMemoDto } from '@app/src/admin/users/dto'
import { AccountStatus } from '@app/src/users/user/enums'
import { UserEntity } from '@app/src/users/user/entities/user.entity'

export default async function (id: string, payload: AdminMemoDto): Promise<SuccessRO> {
  try {
    const user: UserEntity = await this.documentExists({
      condition: [
        {
          where: {
            id,
            account_status: Not(AccountStatus.DELETED),
          },
          select: ['id', 'admin_memo', 'account_status'],
        },
      ],
      message: ErrorKey.USER_NOT_FOUND,
    })

    user.admin_memo = payload.admin_memo

    await this.updateOne(user)

    return {
      success: true,
      message: 'Admin memo updated successfully',
      data: user.toResponseObject(),
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
