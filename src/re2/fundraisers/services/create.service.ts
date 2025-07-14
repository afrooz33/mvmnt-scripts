import { In, Not } from 'typeorm'
import { PreconditionFailedException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey, UploadType } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { AccountStatus } from '@app/src/re2/user/enums'
import { CreateFundraiserDto } from '@app/src/re2/fundraisers/dto'
import { FundraiserType } from '@app/src/re2/fundraisers/enums'
import { DonationProjectStatus } from '@app/src/nonprofit/donation-projects/enums'
import { AccountStatus as NonprofitAccountStatus } from '@app/src/nonprofit/user/enums'

function validatePayload(payload, invalidProps = []) {
  if (typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Invalid payload')
  }

  const invalidProp = Object.keys(payload).find((prop) => invalidProps.includes(prop))

  if (invalidProp) {
    throw new PreconditionFailedException(
      `Precondition failed on property: ${invalidProp}. Invalid properties include: ${invalidProps.join(
        ', ',
      )}`,
    )
  }
}

export default async function (
  payload: CreateFundraiserDto,
  userId: string,
  id: string = null,
): Promise<SuccessRO> {
  try {
    const invalidProps = []

    if (payload.type === FundraiserType.FORM) {
      invalidProps.push('images')
      invalidProps.push('end_date')
      invalidProps.push('is_hidden')
      invalidProps.push('start_date')
      invalidProps.push('description')
      invalidProps.push('goal_amount')
      invalidProps.push('goal_settings')
      invalidProps.push('hex_page_color')
    }

    await validatePayload(payload, invalidProps)

    const condition = {
      public_url: payload.public_url,
      user: {
        id: userId,
      },
    }

    if (id) {
      condition['id'] = Not(id)
    }

    const fundraiser = await this.fundraiserRepository.findOne({
      where: condition,
    })

    if (fundraiser) {
      throw new PreconditionFailedException(ErrorKey.RE2_FUNDRAISER_URL_EXISTS)
    }

    const user = await this.userService.documentExists({
      condition: [
        {
          where: {
            id: userId,
            account_status: AccountStatus.ACTIVE,
          },
        },
      ],
      errorMessage: JSON.stringify({
        key: ErrorKey.RE2_NOT_FOUND,
        args: { id: userId },
      }),
    })

    if (payload.type === FundraiserType.PAGE && !payload.images.length) {
      const images = await this.imagesService.findMany({
        where: {
          id: In(payload.images),
          section: UploadType.FUNDRAISER_FORM_PAGE,
        },
        select: ['id'],
      })

      if (images.length !== payload.images.length) {
        throw new PreconditionFailedException(ErrorKey.INVALID_FUNDRAISER_IMAGES)
      }

      payload.images = images
    }

    const nonprofitLength = payload.nonprofit ? payload.nonprofit.length : 0
    const donationProjectsLength = payload.donation_projects ? payload.donation_projects.length : 0

    if (nonprofitLength + donationProjectsLength > 3) {
      throw new PreconditionFailedException(ErrorKey.INVALID_FUNDRAISER_NONPROFIT_DONATION_PROJECT)
    }

    if (payload.nonprofit && payload.nonprofit.length) {
      const nonprofits = await this.nonprofitUserService.findMany({
        where: {
          id: In(payload.nonprofit),
          account_status: NonprofitAccountStatus.ACTIVE,
        },
      })

      if (nonprofits.length !== payload.nonprofit.length) {
        throw new PreconditionFailedException(ErrorKey.INVALID_FUNDRAISER_NONPROFIT)
      }

      payload.nonprofit = nonprofits
    }

    if (payload.donation_projects && payload.donation_projects.length) {
      const donationProjects = await this.donationProjectsService.findMany({
        where: {
          id: In(payload.donation_projects),
          status: In([DonationProjectStatus.ENDED, DonationProjectStatus.PUBLISHED]),
        },
      })

      if (donationProjects.length !== payload.donation_projects.length) {
        throw new PreconditionFailedException(ErrorKey.INVALID_FUNDRAISER_DONATION_PROJECT)
      }

      payload.donation_projects = donationProjects
    }

    const savedFundraiser = await this.fundraiserRepository.save({
      ...payload,
      user,
    })

    return {
      data: savedFundraiser,
      success: true,
      message: 'Fundraiser successfully processed',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
