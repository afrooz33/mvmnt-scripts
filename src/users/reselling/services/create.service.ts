import { In } from 'typeorm'
import { BadRequestException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { DealStatus, DealType } from '@app/src/users/deal/enums'
import { AccountStatus, UserAccountType } from '@app/src/users/user/enums'

export default async function (userId: string, dealId: string): Promise<SuccessRO> {
  try {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
        account_status: AccountStatus.ENABLED,
        account_type: In([UserAccountType.INDIVIDUAL_INFLUENCER]),
      },
      select: ['id'],
    })

    const deal = await this.dealRepository.findOne({
      where: {
        id: dealId,
        status: In([DealStatus.ON_DEAL, DealStatus.ENDED]),
        deal_type: DealType.BUYNOW,
      },
      relations: [Query.USER],
      select: {
        id: true,
        user: {
          id: true,
        },
      },
    })

    if (!user || !deal) {
      throw new BadRequestException(ErrorKey.INVALID_RESELLING_DEAL_OR_USER)
    }

    const isBanned = await this.resellingBannedUserRepository.findOne({
      where: {
        reseller: {
          id: userId,
        },
        seller: {
          id: deal?.user?.id,
        },
      },
      select: ['id'],
    })

    if (isBanned) {
      throw new BadRequestException(ErrorKey.RESELLER_IS_BANNED_BY_SELLER)
    }

    let existingLink = await this.resellingLinkRepository.findOne({
      where: {
        user: {
          id: userId,
        },
        deal: {
          id: dealId,
        },
      },
    })

    if (!existingLink) {
      const token = await this.generateUniqueToken(userId, dealId)
      const shortUrlCode = await this.generateUniqueShortUrlCode()

      existingLink = this.resellingLinkRepository.create({
        user,
        deal,
        token,
        short_token: shortUrlCode,
      })
    } else {
      if (!existingLink.short_token) {
        existingLink.short_token = await this.generateUniqueShortUrlCode()
      }
    }

    const data = await this.resellingLinkRepository.save(existingLink)

    const redirectUrl = `${process.env.APP_USER_DASHBOARD_URL}/reselling/${data.token}`
    const shortUrl = `${process.env.URL_SHORTENER_BASE_URL}/${data.short_token}`

    return {
      success: true,
      message: 'Reselling link created successfully',
      data: {
        ...data,
        redirect_url: redirectUrl,
        short_url: shortUrl,
      },
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
