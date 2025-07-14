import { BadRequestException } from '@nestjs/common'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { LoginActivity } from '@app/src/users/user/entities/login-activity.entity'

export default async function (user: UserEntity): Promise<LoginActivity> {
  try {
    const login_log: UserEntity = await this.loginActivityRepository.create({
      user: {
        id: user.id,
      },
      login_time: new Date(),
    })

    return await this.loginActivityRepository.save(login_log)
  } catch (error) {
    throw new BadRequestException(error.message ? error.message : error)
  }
}
