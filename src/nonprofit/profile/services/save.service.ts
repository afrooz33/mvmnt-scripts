import { HandleErrors } from '@app/src/shared/helpers/Error.helper'

export default async function (data: any): Promise<{
  success: boolean
  data: any
}> {
  try {
    const profile = await this.nonprofitProfileRepository.create(data)

    const results = await this.nonprofitProfileRepository.save(profile)

    return {
      success: true,
      data: results,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
