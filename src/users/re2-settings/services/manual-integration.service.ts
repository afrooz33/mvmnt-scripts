import { Not } from 'typeorm'
import { BadRequestException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { UserAccountType } from '@app/src/users/user/enums'
import { POINTS_STATUS } from '@app/src/users/points/enums'
import { UserPointsEntity } from '@app/src/users/points/entities/user-points.entity'
import { POINTS_EXPIRY_DAYS } from '@app/src/users/points/constant/points.const'

/**
 * @description Get the expiry date of a point.
 *
 * @param point - The point.
 * @returns The point.
 */
async function GetPointExpiryDate(point: UserPointsEntity) {
  const expiryDate = new Date(point.expiry_date)
  const currentDate = new Date()

  if (expiryDate.getTime() <= currentDate.getTime()) {
    point.status = POINTS_STATUS.EXPIRED
  } else if (point.status !== POINTS_STATUS.EXPIRED) {
    // For active points, set expiry date to POINTS_EXPIRY_DAYS from creation
    const createdDate = new Date(point.created)
    point.expiry_date = new Date(createdDate.getTime() + POINTS_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
  }

  return point
}

/**
 * @description Manually integrate a donation from RE2.
 *
 * @param code - The code of the donation.
 * @param userId - The ID of the user.
 * @returns A success response.
 */
export default async function (code: string, userId: string): Promise<SuccessRO> {
  try {
    const donation = await this.userDonationsRepository.findOne({
      where: {
        donation_code: code,
        user: {
          id: Not(userId),
          account_type: Not(UserAccountType.RE2_SHOPIFY_TEMP_USER),
        },
      },
      relations: [
        'user',
        'original_user',
        'user_donation_payment',
        'user_deal_item_payment',
        'user_donation_payment.points',
        'user_donation_payment.points.user',
        'user_deal_item_payment.points',
        'user_deal_item_payment.points.user',
      ],
      select: {
        id: true,
        user: {
          id: true,
          account_type: true,
        },
        original_user: {
          id: true,
        },
        user_donation_payment: {
          id: true,
          points: {
            id: true,
            expiry_date: true,
            created: true,
            user: {
              id: true,
            },
          },
        },
        user_deal_item_payment: {
          id: true,
          points: {
            id: true,
            expiry_date: true,
            created: true,
            user: {
              id: true,
            },
          },
        },
      },
    })

    if (!donation) {
      throw new BadRequestException(ErrorKey.INVALID_RE2_CODE)
    }

    if (donation.original_user?.id) {
      throw new BadRequestException(ErrorKey.RE2_INTEGRATION_ALREADY_DONE)
    }

    if (donation.user_donation_payment?.points?.length) {
      await Promise.all(
        donation.user_donation_payment.points.map(async (point) => {
          point.original_user = { id: point.user.id }
          point.user = { id: userId }

          point = await GetPointExpiryDate(point)

          return point.save()
        }),
      )
    }

    if (donation.user_deal_item_payment?.points?.length) {
      await Promise.all(
        donation.user_deal_item_payment.points.map(async (point) => {
          point.original_user = { id: point.user.id }
          point.user = { id: userId }

          point = await GetPointExpiryDate(point)

          return point.save()
        }),
      )
    }

    donation.original_user = { id: donation.user.id }
    donation.user = { id: userId }

    await donation.save()

    return {
      success: true,
      data: {
        id: donation.id,
        created: donation.created,
      },
      message: 'Donation integrated successfully',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
