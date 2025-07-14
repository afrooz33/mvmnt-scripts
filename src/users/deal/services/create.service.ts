import { In, Not } from 'typeorm'
import { BadRequestException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { UpdateDealDto } from '@app/src/users/deal/dto'
import { SettingName } from '@app/src/admin/region-settings/enums'
import { TaskScheduleStatus } from '@app/src/task-scheduler/enums'
import { RestrictionType } from '@app/src/users/restrictions/enums'
import { ImagesEntity } from '@app/src/images/entities/images.entity'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { AccountStatus, UserAccountType } from '@app/src/users/user/enums'
import { DeliverySettingStatus } from '@app/src/users/delivery-settings/enums'
import {
  DealType,
  DealStatus,
  DealAvailability,
  PurchaseAvailability,
} from '@app/src/users/deal/enums'
import { DonationProjectStatus } from '@app/src/nonprofit/donation-projects/enums'

/**
 * Validate deal dates
 * @param payload - The payload to validate
 * @param validDeal - The valid deal to validate against (optional for new deals)
 * @returns void
 */
async function validateDealDates(payload: UpdateDealDto, validDeal?: DealEntity) {
  const now = new Date()

  // If updating an existing deal (payload.id exists)
  if (payload.id) {
    if (!validDeal) {
      throw new BadRequestException(ErrorKey.INVALID_PAYLOAD)
    }

    // If the original start date is in the past, don't allow modifying it
    if (validDeal.start_date < now && payload.start_date) {
      throw new BadRequestException(ErrorKey.START_DATE_MUST_BE_IN_THE_FUTURE)
    }

    // If updating end date, ensure it's after start date
    if (payload.end_date) {
      const startDate = payload.start_date || validDeal.start_date
      if (new Date(payload.end_date) <= new Date(startDate)) {
        throw new BadRequestException(ErrorKey.END_DATE_MUST_BE_AFTER_START_DATE)
      }
    }
  }
  // Creating new deal
  else {
    if (!payload.start_date || !payload.end_date) {
      throw new BadRequestException(ErrorKey.START_DATE_AND_END_DATE_ARE_REQUIRED_FOR_DEALS)
    }

    const startDate = new Date(payload.start_date)
    const endDate = new Date(payload.end_date)

    // Validate start date is in the future
    if (startDate <= now) {
      throw new BadRequestException(ErrorKey.START_DATE_MUST_BE_IN_THE_FUTURE)
    }

    // Validate end date is after start date
    if (endDate <= startDate) {
      throw new BadRequestException(ErrorKey.END_DATE_MUST_BE_AFTER_START_DATE)
    }

    // Optional: Validate reasonable date range (e.g., not too far in the future)
    const maxFutureDate = new Date()

    //3 months from now
    maxFutureDate.setMonth(maxFutureDate.getMonth() + 3)

    if (endDate > maxFutureDate) {
      throw new BadRequestException(ErrorKey.END_DATE_CANNOT_BE_MORE_THAN_3_MONTHS_IN_THE_FUTURE)
    }
  }
}

export default async function (payload: UpdateDealDto, userId: string): Promise<SuccessRO> {
  const region_settings = await this.regionSettingsService.find()

  if (payload.status && payload.status !== DealStatus.DRAFT) {
    throw new BadRequestException(ErrorKey.DEAL_STATUS_NOT_ALLOWED)
  }

  if (payload.donation_nonprofit && payload.donation_project) {
    throw new BadRequestException(ErrorKey.BOTH_DONATION_NONPROFIT_AND_PROJECT_NOT_ALLOWED)
  }

  if (payload.deal_type === DealType.RAFFLE && !region_settings[SettingName.RAFFLE_ENABLED]) {
    throw new BadRequestException(ErrorKey.NOT_ALLOWED_TO_CREATE_RAFFLE_DEAL)
  }

  if (
    payload.is_one_of_kind &&
    payload.variants.length > 1 &&
    payload.deal_type === DealType.BUYNOW
  ) {
    throw new BadRequestException(ErrorKey.ONE_OF_KIND_DEAL_CANNOT_HAVE_MULTIPLE_VARIANTS)
  }

  if (
    !payload.is_one_of_kind &&
    payload.variants.length > 1 &&
    payload.deal_type === DealType.BUYNOW
  ) {
    if (!payload.options || payload.options.length === 0) {
      throw new BadRequestException(ErrorKey.INVALID_BUYNOW_VARIANT_OPTIONS)
    }

    const optionIds = payload.options.map((opt) => opt.id)

    for (const variant of payload.variants) {
      if (!variant.option_values || variant.option_values.length !== optionIds.length) {
        throw new BadRequestException(ErrorKey.INVALID_VARIANT_OPTIONS_COUNT)
      }

      const variantOptionIds = variant.option_values.map((ov) => ov.option)
      const hasAllOptions = optionIds.every((optionId) => variantOptionIds.includes(optionId))

      if (!hasAllOptions) {
        throw new BadRequestException(ErrorKey.INVALID_VARIANT_OPTIONS_MISMATCH)
      }
    }

    const options = payload.variants.filter((variant) =>
      variant.option_values.some((option) => option.option),
    )

    if (!options.length) {
      throw new BadRequestException(ErrorKey.INVALID_BUYNOW_VARIANT)
    }
  }

  const user: UserEntity = await this.userService.documentExists({
    condition: [
      {
        where: {
          id: userId,
          account_status: AccountStatus.ENABLED,
        },
        relations: [Query.SHOP_INFO, Query.NONPROFIT],
        select: ['id', 'account_status', 'account_type', 'shop_info'],
      },
    ],
    errorMessage: ErrorKey.USER_NOT_FOUND,
  })

  if (
    (user.account_type === UserAccountType.BUSINESS_COMPANY ||
      user.account_type === UserAccountType.BUSINESS_SOLE_PROPRIETOR ||
      user.nonprofit?.id) &&
    !user.shop_info &&
    region_settings[SettingName.ACT_ON_SPECIFIED_COMMERCIAL]
  ) {
    payload.status = DealStatus.DRAFT
  }

  if (payload.id) {
    const validDeal: DealEntity = await this.findOne({
      where: {
        id: payload.id,
        user: {
          id: userId,
        },
        status: Not(In([DealStatus.DELETED, DealStatus.SUSPENDED, DealStatus.DELETE_REQUESTED])),
      },
      select: ['id', 'deal_type', 'status', 'start_date', 'end_date'],
    })

    if (!validDeal) {
      throw new BadRequestException(ErrorKey.DEAL_NOT_FOUND)
    }

    if (
      (validDeal.deal_type === DealType.RAFFLE ||
        validDeal.status !== DealStatus.DECLINED ||
        validDeal.deal_type === DealType.AUCTION) &&
      validDeal.status !== DealStatus.DRAFT
    ) {
      throw new BadRequestException(ErrorKey.DEAL_NOT_ALLOWED_TO_EDIT)
    }

    await validateDealDates(payload, validDeal)
  }

  if (payload?.available_tokens?.length) {
    await this.tokensService.validateToken([...payload.available_tokens, payload.prioritised_token])
  }

  if (!payload.id) {
    //logic to check if user deleted 5 auctions which result in deal creation restriction
    const restriction = await this.restrictionService.findOne({
      where: {
        user: {
          id: userId,
        },
        restriction_type: RestrictionType.AUCTION_DEAL_DELETION,
      },
      select: ['id', 'data'],
    })

    if (restriction) {
      if (new Date(restriction.data.restriction_date).getTime() > new Date().getTime()) {
        throw new BadRequestException(ErrorKey.NOT_ALLOWED_TO_CREATE_DEAL)
      }
    }

    await validateDealDates(payload)
  }

  if (
    (payload.deal_type === DealType.AUCTION || payload.deal_type === DealType.BUYNOW) &&
    payload.raffles
  ) {
    throw new BadRequestException(ErrorKey.RAFFLES_NOT_ALLOWED)
  }

  if (
    (payload.deal_type === DealType.AUCTION || payload.deal_type === DealType.RAFFLE) &&
    payload.variants
  ) {
    throw new BadRequestException(ErrorKey.VARIANTS_NOT_ALLOWED)
  }

  if (payload.id && payload.deal_type !== DealType.BUYNOW) {
    throw new BadRequestException(ErrorKey.DEAL_NOT_ALLOWED_TO_EDIT)
  }

  const systemFee = await this.systemFeeService.findByUserOrDefault(null)

  await this.validateResellingSettings(payload)
  await this.validateDonationAmount(payload, user, systemFee)

  if (!payload.id && payload.deal_type === DealType.RAFFLE && payload.status !== DealStatus.DRAFT) {
    payload.status = DealStatus.UNLISTED
  }

  let images = []

  if (payload.deal_type === DealType.AUCTION) {
    images = await this.imagesService.findMany({
      where: {
        id: In(payload.images),
      },
      select: ['id'],
    })
  }

  const variants = []
  const rafflePrizes = []
  const dealSave = {
    ...payload,
    images,
    user: {
      id: userId,
    },
  }

  if (payload.variants && payload.deal_type === DealType.BUYNOW) {
    await Promise.all(
      payload.variants.map(async (variant) => {
        const images: ImagesEntity[] = await this.imagesService.findMany({
          where: {
            id: In(variant.images),
          },
          select: ['id'],
        })

        let tag = null

        if (variant.product_tag) {
          tag = await this.productTagService.findOne({
            where: {
              id: variant.product_tag,
              status: DeliverySettingStatus.ENABLED,
              delivery_settings: {
                user: {
                  id: userId,
                },
              },
            },
            select: ['id'],
          })

          if (!tag) {
            throw new BadRequestException(ErrorKey.PRODUCT_TAG_NAME_NOT_FOUND)
          }
        }

        if (!payload.is_one_of_kind) {
          const inventory = await this.applicableShippingOrigin(userId, payload?.id, variant?.id)

          const isValidVariantInventory = await this.validateBuynowVariantPayload(
            payload,
            inventory,
          )

          if (!isValidVariantInventory) {
            throw new BadRequestException(ErrorKey.INVALID_VARIANT_INVENTORY)
          }
        } else {
          payload.variants[0].inventory = [
            {
              quantity: 1,
            },
          ]
        }

        variants.push({
          ...variant,
          images,
          tag,
        })
      }),
    )

    dealSave.variants = variants
  }

  if (payload.raffles && payload.deal_type === DealType.RAFFLE) {
    await Promise.all(
      payload.raffles.raffle_prizes.map(async (rafflePrize) => {
        const images: ImagesEntity[] = await this.imagesService.findMany({
          where: {
            id: In(rafflePrize.images),
          },
          select: ['id'],
        })

        rafflePrizes.push({
          ...rafflePrize,
          images,
        })
      }),
    )

    dealSave.raffles = {
      ...payload.raffles,
      raffle_prizes: rafflePrizes,
    }
  }

  let addQueue = false

  if (
    payload.purchase_availability === PurchaseAvailability.SPECIFIC_DATE &&
    payload.status !== DealStatus.DRAFT
  ) {
    addQueue = true
    dealSave.status = DealStatus.SCHEDULED
  }

  if (payload.purchase_availability === PurchaseAvailability.IMMEDIATELY) {
    payload.start_date = new Date()
  }

  if (payload.deal_availability === DealAvailability.MATCH_PURCHASE_AVAILABILITY) {
    payload.deal_access_date = payload.start_date
  }

  if (payload.donation_nonprofit && !payload.donation_project) {
    const donationProject = await this.donationProjectRepository.findOneOrFail({
      where: {
        user: {
          id: payload.donation_nonprofit,
        },
        status: DonationProjectStatus.DEFAULT,
      },
      select: ['id', 'status'],
    })

    dealSave.donation_project = donationProject.id
  } else if (payload.donation_project && !payload.donation_nonprofit) {
    const donationProject = await this.donationProjectRepository.findOneOrFail({
      where: {
        id: payload.donation_project,
      },
      relations: ['user'],
      select: {
        id: true,
        user: {
          id: true,
        },
      },
    })

    dealSave.donation_nonprofit = donationProject.user.id
  }

  const deal: DealEntity = await this.updateOne(dealSave)

  if (payload.status !== DealStatus.DRAFT) {
    const currentDate: any = new Date()
    const name = `Publish user deal [${deal.id}]`
    const schedule_date: any = new Date(payload.start_date)

    if (addQueue && payload.deal_type !== DealType.RAFFLE) {
      const existingTask = await this.taskSchedulerService.findOne({
        where: {
          name,
          status: TaskScheduleStatus.PENDING,
        },
      })

      if (existingTask) {
        const jobToRemove = await this.dealQueue.getJob(existingTask.job_id)

        await jobToRemove?.remove()

        existingTask.status = TaskScheduleStatus.DELETED

        await this.taskSchedulerService.updateOne(existingTask)
      }

      const dealSchedule = await this.dealQueue.add(
        name,
        {
          id: deal.id,
          schedule_date: deal.start_date,
        },
        {
          delay: schedule_date - currentDate,
          removeOnComplete: true,
          removeOnFail: false,
        },
      )

      await this.taskSchedulerService.create({
        job_id: dealSchedule.id,
        name,
        data: dealSchedule.data,
        scheduled_at: deal.start_date,
      })
    }
  }

  if (
    payload?.available_tokens?.length &&
    payload?.prioritised_token &&
    payload.status !== DealStatus.DRAFT
  ) {
    const availableTokens = Array.from(new Set(payload.available_tokens))

    await this.userService.userRepository.update(
      {
        id: userId,
      },
      {
        available_tokens: availableTokens,
        prioritised_token: payload.prioritised_token,
      },
    )
  }

  return {
    success: true,
    message: `Deal [${deal.id}] successfully saved`,
    data: deal,
  }
}
