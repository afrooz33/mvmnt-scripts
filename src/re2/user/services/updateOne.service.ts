import { ErrorKey } from '@app/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
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

    const user: UserEntity = await this.userRepository.create(payload)

    return await this.userRepository.save(user)
  } catch (error) {
    return HandleErrors(error)
  }
}
