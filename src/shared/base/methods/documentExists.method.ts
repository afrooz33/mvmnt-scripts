import { NotFoundException } from '@nestjs/common'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'

export default async function (condition: any[], message: string) {
  let exists

  try {
    exists = await this.findOne(...condition)

    if (exists) {
      return exists
    }
  } catch (error) {
    return HandleErrors(error)
  }

  if (!exists) {
    throw new NotFoundException(message)
  }
}
