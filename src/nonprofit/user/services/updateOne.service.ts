import { BadRequestException } from '@nestjs/common'
import { ErrorKey } from '@app/shared/enums'
import { NonprofitUserEntity } from '@app/src/nonprofit/user/entities/nonprofit-user.entity'

export default async function (
  payload: any,
  options?: any,
  updatePassword?: boolean,
): Promise<NonprofitUserEntity> {
  if (options) {
    await this.documentExists({
      condition: [
        {
          where: {
            id: options.id,
          },
        },
      ],
      message: JSON.stringify({
        key: ErrorKey.USER_NOT_FOUND,
        args: { id: options.id },
      }),
    })
  }

  try {
    if (!updatePassword) {
      delete payload.password
    }

    const user: NonprofitUserEntity = await this.nonprofitUserRepository.create(payload)

    return await this.nonprofitUserRepository.save(user)
  } catch (error) {
    throw new BadRequestException(error.message ? error.message : error)
  }
}
