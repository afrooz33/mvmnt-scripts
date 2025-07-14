import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { CreateSystemFeeDto } from '@app/src/admin/system-fee/dto'
import { SystemFeeEntity } from '@app/src/admin/system-fee/entities/system-fee.entity'

export default async function (payload: CreateSystemFeeDto) {
  try {
    const existing: SystemFeeEntity = await this.findOne({
      where: {
        user: payload.user,
      },
      select: ['id'],
    })

    const resource: SystemFeeEntity = await this.updateOne({
      ...existing,
      ...payload,
    })

    return {
      success: true,
      message: 'System fee successfully saved',
      data: resource,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
