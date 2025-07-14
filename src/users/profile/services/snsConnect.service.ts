import { In } from 'typeorm'
import { AccountStatus } from '@app/src/users/user/enums'
import { ProfileEntity } from '@app/src/users/profile/entities/profile.entity'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'

export default async function snsConnectService(
  snsProfile: Record<string, any>,
  userId: string,
  provider: string,
) {
  try {
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
        [provider]: snsProfile,
      },
    })

    return {
      success: true,
      message: `${provider.toUpperCase()} profile successfully connected`,
      data: updatedProfile,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
