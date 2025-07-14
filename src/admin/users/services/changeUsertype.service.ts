import { In, Not } from 'typeorm'
import { ErrorKey } from '@app/src/shared/enums'
import { BadRequestException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { AccountStatus } from '@app/src/users/user/enums'
import { ChangeUserTypeDto } from '@app/src/admin/users/dto'
import { UserEntity } from '@app/src/users/user/entities/user.entity'

export default async function (payload: ChangeUserTypeDto, id: string): Promise<SuccessRO> {
  const user: UserEntity = await this.documentExists({
    condition: [
      {
        where: {
          id,
          account_status: Not(In([AccountStatus.BLOCKED, AccountStatus.DELETED])),
        },
        select: ['id', 'account_type'],
      },
    ],
    message: ErrorKey.USER_NOT_FOUND,
  })

  if (
    user.account_type.toString().includes('BUSINESS_') &&
    !payload.account_type.toString().includes('BUSINESS_')
  ) {
    throw new BadRequestException('Cannot change account type of business user')
  }

  if (
    user.account_type.toString().includes('INDIVIDUAL_') &&
    !payload.account_type.toString().includes('INDIVIDUAL_')
  ) {
    throw new BadRequestException('Cannot change account type of individual user')
  }

  user.account_type = payload.account_type
  delete user.password

  await this.updateOne(user)

  return {
    success: true,
    message: `User [${user.id}] successfully saved`,
    data: user.toResponseObject(),
  }
}
