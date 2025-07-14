import { SuccessRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { CreateHomepageDto } from '@app/src/admin/homepages/dto'
import { HomepagesEntity } from '@app/src/admin/homepages/entities/homepages.entity'
import {
  HomepageTitle,
  HomepageStatus,
  HomepageContentSearchType,
} from '@app/src/admin/homepages/enums'

export default async function (payload: CreateHomepageDto): Promise<SuccessRO> {
  try {
    const total = await this.homepageRepository.count()

    const homepages: HomepagesEntity[] = await this.homepageRepository.save(
      payload.types.map((type) => ({
        display_order: total + 1,
        type,
        status: HomepageStatus.DISABLED,
        search_type: type === HomepageTitle.TRENDING_DEALS ? HomepageContentSearchType.DEALS : null,
      })),
    )

    return {
      success: true,
      message: 'Homepages created successfully',
      data: homepages,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
