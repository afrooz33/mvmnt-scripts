import { SuccessRO } from '@app/src/shared/dto'
import { DONATION_STATUS } from '@app/src/donations/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import {
  StatTotalDonorQuery,
  StatTotalDonationQuery,
  StatTotalAdminMarginQuery,
} from '@app/src/shared/sql'
import { TopStatQueryDto } from '@app/src/admin/payments/dto'

export default async function (query: TopStatQueryDto): Promise<SuccessRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.donationsRepository)
      .create()

    results.condition.andWhere(`"data"."status" IN (:...donation_status)`, {
      donation_status: [DONATION_STATUS.COMPLETED, DONATION_STATUS.SETTLED],
    })

    results.condition.select([
      `${StatTotalDonorQuery()} "total_no_donation"`,
      `${StatTotalDonationQuery(query, true)} "total_donation"`,
      `${StatTotalAdminMarginQuery(query, false)} "total_admin_margin"`,
      `${StatTotalAdminMarginQuery(query, true)} "total_admin_margin_by"`,
    ])

    results.condition.limit(1)

    return {
      success: true,
      data: await results.condition.getRawOne(),
      message: '',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
