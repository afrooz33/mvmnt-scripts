import { BadRequestException } from '@nestjs/common'
import { ErrorKey } from '@app/shared/enums'
import { UserEntity } from '@app/src/users/user/entities/user.entity'

export default async function (
  payload: any,
  options?: any,
  updatePassword?: boolean,
): Promise<UserEntity> {
  if (options) {
    await this.documentExists({
      condition: [
        {
          where: {
            id: options.id,
          },
          select: ['id'],
        },
      ],
      errorMessage: ErrorKey.USER_NOT_FOUND,
    })
  }

  try {
    if (!updatePassword) {
      delete payload.password
    }

    const user: UserEntity = await this.userRepository.create(payload)

    return await this.userRepository.save(user)
  } catch (error) {
    throw new BadRequestException(error.message ? error.message : error)
  }
}
