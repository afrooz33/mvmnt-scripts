import { In } from 'typeorm'
import { AccountStatus } from '@app/src/users/user/enums'
import { SnsProviderDto } from '@app/src/users/profile/dto'
import { ProfileEntity } from '@app/src/users/profile/entities/profile.entity'

export default async function snsConnectService(provider: SnsProviderDto, userId: string) {
  const profile: ProfileEntity = await this.findOne({
    where: {
      user: {
        id: userId,
        account_status: In([AccountStatus.ENABLED]),
      },
    },
    select: ['id', 'social_accounts'],
  })

  const updatedProfile: ProfileEntity = await this.updateOne({
    ...profile,
    social_accounts: {
      ...profile.social_accounts,
      [provider.provider]: null,
    },
  })

  return {
    success: true,
    message: `${provider.provider.toUpperCase()} profile successfully removed.`,
    data: updatedProfile,
  }
}
