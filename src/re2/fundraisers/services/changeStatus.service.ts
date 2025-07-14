import { Not } from 'typeorm'
import { PreconditionFailedException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { GetRe2DonationQuery } from '@app/src/shared/sql/common.sql'
import { DonationType } from '@app/src/donations/enums'
import { FundraiserChangeStatusDto } from '@app/src/re2/fundraisers/dto'
import { FundraiserChangeStatus, FundraiserStatus } from '@app/src/re2/fundraisers/enums'

export default async function (
  id: string,
  payload: FundraiserChangeStatusDto,
  userId: string,
): Promise<SuccessRO> {
  try {
    const fundraiser = await this.documentExists({
      condition: [
        {
          where: {
            id,
            user: {
              id: userId,
            },
            status: Not(FundraiserStatus.DELETED),
          },
          select: ['id'],
        },
      ],
      errorMessage: JSON.stringify({
        key: ErrorKey.RE2_FUNDRAISER_NOT_FOUND,
        args: { id },
      }),
    })

    if (
      (payload.status === FundraiserChangeStatus.DISABLED ||
        payload.status === FundraiserChangeStatus.ENABLED) &&
      fundraiser.status === FundraiserStatus.SUSPENDED
    ) {
      throw new PreconditionFailedException(ErrorKey.RE2_FUNDRAISER_ALREADY_SUSPENDED)
    }

    if (
      payload.status === FundraiserChangeStatus.HIDDEN &&
      fundraiser.status !== FundraiserStatus.PUBLISHED
    ) {
      throw new PreconditionFailedException(ErrorKey.RE2_FUNDRAISER_CANNOT_HIDE)
    }

    const donations = await this.fundraiserRepository.query(
      GetRe2DonationQuery({
        re2Id: id,
        donationType: [
          DonationType.FUNDRAISER_FORM,
          DonationType.FUNDRAISER_PAGE,
          DonationType.INTEGRATION_CART_BANNER,
          DonationType.INTEGRATION_CART_DRAWER,
          DonationType.INTEGRATION_SALES_PORTION,
        ],
        select: `COALESCE(COUNT(*), 0) as count`,
        isAll: true,
      }),
    )

    if (donations[0].count > 0 && payload.status === FundraiserChangeStatus.PUBLISHED) {
      throw new PreconditionFailedException(ErrorKey.RE2_FUNDRAISER_HAS_DONATIONS)
    }

    if (
      payload.status === FundraiserChangeStatus.PUBLISHED &&
      fundraiser.status !== FundraiserStatus.HIDDEN
    ) {
      throw new PreconditionFailedException(ErrorKey.PUBLISHED_STATUS_UPDATE_NOT_ALLOWED)
    }

    await this.fundraiserRepository.update(
      {
        id,
        user: {
          id: userId,
        },
      },
      {
        status: payload.status,
      },
    )

    return {
      success: true,
      message: 'Fundraiser form or page status updated successfully.',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
