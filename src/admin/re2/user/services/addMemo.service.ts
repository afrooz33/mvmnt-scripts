import { Not } from 'typeorm'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { AccountStatus } from '@app/src/re2/user/enums'
import { Re2AddMemoDto } from '@app/src/admin/re2/user/dto'

export default async function (payload: Re2AddMemoDto): Promise<SuccessRO> {
  try {
    const user = await this.documentExists({
      condition: [
        {
          where: {
            id: payload.user,
            account_status: Not(AccountStatus.DELETED),
          },
          select: {
            id: true,
            email: true,
            admin_memo: true,
          },
        },
      ],
      errorMessage: ErrorKey.USER_NOT_FOUND,
    })

    user.admin_memo = payload.admin_memo

    await this.updateOne(user)

    return {
      success: true,
      message: 'Memo added successfully',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
