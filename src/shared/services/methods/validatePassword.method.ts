import { UnauthorizedException } from '@nestjs/common'

export default async function (user: any, password: string, errorKey?: string): Promise<boolean> {
  const validPassword = await user.comparePassword(password)

  if (!validPassword) {
    throw new UnauthorizedException(errorKey)
  }

  return true
}
