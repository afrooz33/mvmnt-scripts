import { In, Not } from 'typeorm'
import { BadRequestException, PreconditionFailedException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey, Status } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { DealStatus } from '@app/src/users/deal/enums'
import { EditContentDto } from '@app/src/admin/homepages/dto'
import { HomepagesEntity } from '@app/src/admin/homepages/entities/homepages.entity'
import { UserConditionRules, DealConditionRules } from '@app/src/admin/homepages/mapper'
import {
  HomepageTitle,
  ContentSelection,
  HomepageContentSearchType,
} from '@app/src/admin/homepages/enums'

const validatePayload = async function (
  payload: EditContentDto,
  homepage: HomepagesEntity,
): Promise<void> {
  // Validate 'title'
  if (
    homepage.type !== HomepageTitle.EDITOR_PICKS &&
    (!payload.title || payload.title.trim() === '')
  ) {
    throw new BadRequestException('Title is required for non-editor picks')
  }

  // Validate 'description'
  if (
    homepage.type === HomepageTitle.CUSTOM_LIST &&
    (!payload.description || payload.description.trim() === '')
  ) {
    throw new BadRequestException('Description is required for custom lists')
  }

  if (payload.description && payload.description.length > 255) {
    throw new BadRequestException('Description must not exceed 255 characters')
  }

  // Validate 'translations' only if type is CUSTOM_LIST
  if (homepage.type === HomepageTitle.CUSTOM_LIST) {
    if (payload.translations) {
      if (!Array.isArray(payload.translations) || payload.translations.length < 1) {
        throw new BadRequestException(
          'At least 1 translation is required for custom lists if provided',
        )
      }

      if (payload.translations.length > 10) {
        throw new BadRequestException('No more than 10 translations are allowed')
      }

      payload.translations.forEach((translation) => {
        if (!translation.language || !translation.title) {
          throw new BadRequestException('Each translation must have a language and a title')
        }
      })
    }
  }

  // Validate 'contents'
  // if (!payload.contents || !Array.isArray(payload.contents) || payload.contents.length < 1) {
  //   throw new BadRequestException('At least 1 content reference must be added')
  // }

  // if (payload.contents.length > 30) {
  //   throw new BadRequestException('No more than 30 content references are allowed')
  // }

  // Validate 'selection'
  if (
    (homepage.type === HomepageTitle.CUSTOM_LIST || homepage.type === HomepageTitle.EDITOR_PICKS) &&
    payload.selection === ContentSelection.AUTO &&
    !Object.values(ContentSelection).includes(payload.selection)
  ) {
    throw new BadRequestException('Invalid selection type for auto content selection')
  }

  // Validate 'search_type'
  if (
    (homepage.type === HomepageTitle.CUSTOM_LIST || homepage.type === HomepageTitle.EDITOR_PICKS) &&
    payload.search_type &&
    !Object.values(HomepageContentSearchType).includes(payload.search_type)
  ) {
    throw new BadRequestException('Invalid search type for custom lists or editor picks')
  }

  // Validate 'search_conditions'
  if (
    (homepage.type === HomepageTitle.CUSTOM_LIST || homepage.type === HomepageTitle.EDITOR_PICKS) &&
    payload.selection === ContentSelection.AUTO
  ) {
    if (!payload.search_conditions || payload.search_conditions.length < 1) {
      throw new BadRequestException('At least 1 search condition is required for auto selection')
    }

    if (payload.search_conditions.length > 10) {
      throw new BadRequestException('No more than 10 search conditions are allowed')
    }

    payload.search_conditions.forEach((condition) => {
      if (!condition.field || !condition.condition) {
        throw new BadRequestException('Each search condition must have a field and a condition')
      }
    })
  }
}

const validateConditions = async function (payload: EditContentDto): Promise<void> {
  const validationRules =
    payload.search_type === HomepageContentSearchType.USERS
      ? UserConditionRules
      : DealConditionRules

  for (const searchCondition of payload.search_conditions) {
    if (!validationRules[searchCondition.field].includes(searchCondition.condition)) {
      throw new BadRequestException(`Invalid search condition for field ${searchCondition.field}`)
    }
  }
}

const validateContents = async function (
  payload: EditContentDto,
  homepage: HomepagesEntity,
): Promise<unknown> {
  if (
    (payload.search_type || payload.search_conditions || payload.selection) &&
    homepage.type !== HomepageTitle.CUSTOM_LIST &&
    homepage.type !== HomepageTitle.EDITOR_PICKS
  ) {
    throw new BadRequestException(
      'search_type, search_conditions, selection are not allowed for this type',
    )
  }

  if (payload.selection === ContentSelection.AUTO) {
    return null
  }

  let type = 'user'
  let repository = this.userRepository
  let condition: any = { status: Status.ENABLED }

  switch (homepage.type) {
    case HomepageTitle.BRAND_LIST:
      type = 'brand'
      repository = this.brandRepository
      break
    case HomepageTitle.USER_LIST:
      condition = {
        account_status: Status.ENABLED,
      }
      break
    case HomepageTitle.CATEGORY_LIST:
      type = 'category'
      repository = this.dealCategoryRepository
      break
    case HomepageTitle.CUSTOM_LIST:
    case HomepageTitle.EDITOR_PICKS:
      if (
        payload.selection === ContentSelection.MANUAL &&
        payload.search_type === HomepageContentSearchType.DEALS
      ) {
        type = 'deal'
        repository = this.dealRepository
        condition = {
          status: In([DealStatus.ON_DEAL, DealStatus.ENDED]),
        }
      }

      if (
        payload.selection === ContentSelection.MANUAL &&
        payload.search_type === HomepageContentSearchType.USERS
      ) {
        type = 'user'
        repository = this.userRepository
        condition = {
          account_status: Status.ENABLED,
        }
      }
      break
  }

  const content_type = payload.contents.map((content) => content[type])

  const content_length = payload.contents.filter(
    (content) => Object.keys(content).length > 1,
  ).length

  if (content_length > 0) {
    throw new BadRequestException(ErrorKey.INVALID_PAYLOAD)
  }

  if (content_type.length !== payload.contents.length) {
    throw new BadRequestException(ErrorKey.INVALID_CONTENT_PAYLOAD)
  }

  if (!payload.contents[0][type]?.length) {
    throw new PreconditionFailedException(ErrorKey.INVALID_CONTENT_PAYLOAD)
  }

  const total_record = await repository.find({
    where: {
      id: In(payload.contents[0][type]),
      ...condition,
    },
    select: ['id'],
  })

  if (total_record.length !== payload.contents[0][type].length) {
    throw new BadRequestException(`Invalid ${type} id`)
  }

  return [...total_record.map((item) => ({ [type]: item }))]
}

export default async function (id: string, payload: EditContentDto): Promise<SuccessRO> {
  try {
    const homepage: HomepagesEntity = await this.documentExists({
      condition: [
        {
          where: {
            id,
            status: Not(Status.DELETED),
          },
          select: ['id', 'type'],
        },
      ],
      message: ErrorKey.RESOURCE_NOT_FOUND,
    })

    await validatePayload.bind(this)(payload, homepage)

    if (
      homepage.type === HomepageTitle.CUSTOM_LIST ||
      homepage.type === HomepageTitle.EDITOR_PICKS
    ) {
      if (payload.selection === ContentSelection.AUTO) {
        await validateConditions.bind(this)(payload)
      }

      if (payload?.contents?.length) {
        const isValid = payload.contents.every((obj) => {
          const keys = Object.keys(obj)

          const hasUser = keys.includes('user')
          const hasDeal = keys.includes('deal')

          // Check if the object has either 'user' or 'deal', but not both
          const isValidObject = (hasUser || hasDeal) && !(hasUser && hasDeal)

          // Check if there are no other properties other than 'user' or 'deal'
          const hasNoOtherProperties = keys.every((key) => key === 'user' || key === 'deal')

          return isValidObject && hasNoOtherProperties
        })

        if (!isValid) {
          throw new PreconditionFailedException(ErrorKey.ONLY_DEAL_OR_USER_ALLOWED)
        }
      }
    }

    payload.contents = await validateContents.bind(this)(payload, homepage)

    await this.homepageContentRepository.delete({
      homepage: id,
    })
    await this.homepageTranslationRepository.delete({
      homepage: id,
    })
    await this.homepageSearchConditionsRepository.delete({
      homepage: id,
    })

    const saved = await this.homepageRepository.save({
      ...homepage,
      ...payload,
    })

    return {
      success: true,
      message: 'Homepage content successfully updated',
      data: saved,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
