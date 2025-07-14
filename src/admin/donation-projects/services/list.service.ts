import { PaginateRO } from '@app/src/shared/dto'
import { MyPaginateDto } from '@app/src/shared/base'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import {
  GetDonationProjectImageQuery,
  GetDonationProjectDonationQuery,
  GetNetOrGrossDonationField,
} from '@app/src/shared/sql'
import { DonationType } from '@app/src/donations/enums'
import { DonationProjectStatus } from '@app/src/nonprofit/donation-projects/enums'

export default async function (userId: string, query: MyPaginateDto): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .addFilter('user', userId)
      .useQuery(this.donationProjectRepository)
      .create()

    results.condition.andWhere('"data"."status" IN (:...status)', {
      status: [
        DonationProjectStatus.PUBLISHED,
        DonationProjectStatus.ENDED,
        DonationProjectStatus.PUBLISHED,
        DonationProjectStatus.SUSPENDED,
        DonationProjectStatus.TO_BE_CANCELLED,
      ],
    })

    results.condition.select([
      `"data"."id"`,
      `"data"."name"`,
      `"data"."status"`,
      `"data"."is_schedule"`,
      `"data"."schedule_date"`,
      `"data"."deadline_date"`,
      `"data"."published_date"`,
      `"data"."is_deadline_enabled"`,
      `${GetDonationProjectImageQuery(
        `"data"."id" = "donation_project_images"."donationProjectsId"`,
      )} as "image"`,
      `(${GetDonationProjectDonationQuery('data', 'COALESCE(SUM("donation"."amount"), 0)', [
        DonationType.RAFFLE,
        DonationType.BUYNOW,
        DonationType.AUCTION,
      ])}) as total_deal_donation`,
      `(${GetDonationProjectDonationQuery('data', 'COALESCE(SUM("donation"."amount"), 0)', [
        DonationType.DIRECT_DONATION,
      ])}) as total_direct_donation`,
      `(${GetDonationProjectDonationQuery(
        'data',
        `COALESCE(SUM(${GetNetOrGrossDonationField('donation', false)}), 0)`,
      )}) as total_net_donation`,
      `(${GetDonationProjectDonationQuery(
        'data',
        `COALESCE(SUM(${GetNetOrGrossDonationField('donation', true)}), 0)`,
      )}) as total_gross_donation`,
    ])

    return await this.rawPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
