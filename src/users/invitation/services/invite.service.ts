import { Response } from 'express'
import { setCookieService } from '@app/src/shared/services'
import { InvitationDto } from '@app/src/users/invitation/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'

export default async function (res: Response, payload: InvitationDto): Promise<any> {
  try {
    await setCookieService(res, payload.code, 'x-referral-code')

    return res.json({ message: 'Invitation code set' })
  } catch (error) {
    return HandleErrors(error)
  }
}
