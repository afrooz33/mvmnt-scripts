import { SuccessRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { StarActionType } from '@app/src/users/stars/enums'

export default async function (user: string, invited_by: string): Promise<SuccessRO> {
  try {
    const invitation = await this.invitationRepository.save({
      user,
      invited_by,
    })

    this.eventEmitter.emit('user.award.contribution.stars', {
      userId: invited_by,
      action: StarActionType.FRIEND_INVITE,
      metadata: {
        invitation: user,
      },
    })

    return {
      message: 'Invitation saved successfully',
      data: invitation,
      success: true,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
