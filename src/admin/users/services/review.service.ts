import { BadRequestException } from '@nestjs/common'
import { ErrorKey } from '@app/src/shared/enums'
import { SuccessRO } from '@app/src/shared/dto'
import { ReviewDto } from '@app/src/admin/users/dto'
import { AccountStatus } from '@app/src/users/user/enums'
import { UserEntity } from '@app/src/users/user/entities/user.entity'

export default async function (payload: ReviewDto, id: string): Promise<SuccessRO> {
  if (id !== payload.id) {
    throw new BadRequestException(`User id [${id}] does not match payload id [${payload.id}]`)
  }

  const user: UserEntity = await this.documentExists({
    condition: [
      {
        where: {
          id,
          account_status: AccountStatus.UNDER_REVIEW,
        },
      },
    ],
    message: ErrorKey.USER_NOT_FOUND,
  })

  user.account_status = payload.status
  user.admin_memo = payload.admin_memo ? payload.admin_memo : null

  delete user.password

  await this.updateOne(user)

  return {
    success: true,
    message: `User [${user.id}] successfully saved`,
    data: user.toResponseObject(),
  }
}
