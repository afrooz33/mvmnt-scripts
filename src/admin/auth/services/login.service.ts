import { ErrorKey, Status } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { AdminLoginDto, AdminUserRO } from '@app/src/admin/auth/dto'
import { validatePasswordMethod } from '@app/src/shared/services/methods'

export default async function ({ email, password }: AdminLoginDto): Promise<AdminUserRO> {
  const user = await this.adminUserService.documentExists({
    condition: [
      {
        where: {
          email,
          status: Status.ENABLED,
        },
      },
    ],
    errorMessage: ErrorKey.ADMIN_NOT_FOUND,
  })

  await validatePasswordMethod(user, password, ErrorKey.INVALID_CREDENTIALS)

  try {
    const token: any = await this.jwtService.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      {
        expiresIn: this.configService.get('auth.jwt.access.expiresIn'),
      },
    )

    return user.toResponseObject({
      type: 'bearer',
      token,
    })
  } catch (error) {
    return HandleErrors(error)
  }
}
