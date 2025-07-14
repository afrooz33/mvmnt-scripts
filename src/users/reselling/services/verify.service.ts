import { In } from 'typeorm'
import { Request, Response } from 'express'
import { BadRequestException } from '@nestjs/common'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { decodeCookieService, setCookieService } from '@app/src/shared/services'
import { ResellingEventType } from '@app/src/users/reselling/enums'
import { AccountStatus, UserAccountType } from '@app/src/users/user/enums'

export default async function (
  token: string,
  req: Request,
  res: Response,
  userId?: string,
): Promise<unknown> {
  try {
    const resellingLink = await this.documentExists({
      condition: [
        {
          where: [
            {
              token,
              user: {
                account_type: In([UserAccountType.INDIVIDUAL_INFLUENCER]),
                account_status: AccountStatus.ENABLED,
              },
            },
            {
              short_token: token,
              user: {
                account_type: In([UserAccountType.INDIVIDUAL_INFLUENCER]),
                account_status: AccountStatus.ENABLED,
              },
            },
          ],
          relations: [Query.USER, Query.DEAL],
          select: {
            user: {
              id: true,
            },
            deal: {
              id: true,
            },
          },
        },
      ],
    })

    if (resellingLink.user.id === userId) {
      throw new BadRequestException(ErrorKey.INVALID_RESELLING_TOKEN)
    }

    // Initialize resellingDeals in session if not already present
    let resellingDeals: any = await decodeCookieService(req, 'x-reselling-deals')

    resellingDeals = resellingDeals ? JSON.parse(resellingDeals) : null

    if (!resellingDeals || typeof resellingDeals !== 'object') {
      resellingDeals = {}
    }

    const dealId = resellingLink.deal.id
    const resellerId = resellingLink.user.id
    const resellingLinkId = resellingLink.id

    // Update the reseller info for the deal in the session
    resellingDeals[dealId] = {
      resellerId,
      resellingLinkId,
    }

    await setCookieService(res, JSON.stringify(resellingDeals), 'x-reselling-deals')

    // Emit an event for tracking
    await this.eventEmitter.emit('reselling.event.track', {
      req,
      user_id: userId,
      deal_id: resellingLink.deal.id,
      type: ResellingEventType.CLICK,
    })

    return resellingLink
  } catch (error) {
    return HandleErrors(error)
  }
}
