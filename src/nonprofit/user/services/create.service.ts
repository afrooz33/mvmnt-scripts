import { SuccessRO } from '@app/src/shared/dto'

export default async function (payload: any): Promise<SuccessRO> {
  const user: any = await this.userRepository.create(payload)

  return await this.userRepository.save(user)
}
