import { BadRequestException } from '@nestjs/common'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryDto } from '@app/src/homepages/dto'
import { HomepageContentSearchType } from '@app/src/admin/homepages/enums'
import { HomepagesEntity } from '@app/src/admin/homepages/entities/homepages.entity'

export default async function (
  homepage: HomepagesEntity,
  query: QueryDto,
): Promise<QueryBuilderDataInterface> {
  try {
    if (homepage.search_type === HomepageContentSearchType.USERS) {
      return await this.userList(homepage, query)
    }

    if (homepage.search_type === HomepageContentSearchType.DEALS) {
      return await this.dealList(homepage, query)
    }

    throw new BadRequestException('Invalid homepage type')
  } catch (error) {
    return HandleErrors(error)
  }
}
