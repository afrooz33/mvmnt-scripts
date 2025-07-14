import { ExportToCsv } from 'export-to-csv'
import { NotFoundException } from '@nestjs/common'
import { PaginateRO } from '@app/src/shared/dto'
import { CheckNonprofitDonationQuery } from '@app/src/shared/sql'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { ICsvNonprofitPaymentDonor, QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { DonationFrequency } from '@app/src/donations/enums'
import { DonorListQueryDto } from '@app/src/admin/payments/dto'

export default async function (
  id: string,
  query: DonorListQueryDto,
  isExport = false,
): Promise<PaginateRO | ICsvNonprofitPaymentDonor[]> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.donationsRepository)
      .addRelation('user')
      .addRelation('user.profile')
      .addRelation('user.profile.profile_images')
      .addRelation('deal')
      .addRelation('donation_project')
      .addRelation('nonprofit')
      .addRelation('payment_currency')
      .create()

    results.condition.andWhere(CheckNonprofitDonationQuery('data', id))

    results.condition.leftJoinAndSelect('nonprofit.profile', 'nonprofit_profile')

    results.condition.select([
      'data.id as id',
      'data.amount as amount',
      'data.reason as reason',
      'data.amount - data.system_fees as net_amount',
      'data.donation_method as donation_method',
      `CASE
        WHEN "data"."is_recurring"
          THEN '${DonationFrequency.RECURRING}'
        ELSE '${DonationFrequency.ONE_TIME}'
      END donation_frequency`,
      'user.id as user_id',
      'user.account_type',
      'user.username',
      'user.display_name',
      'data.created as created',
      'profile_images.url as profile_image_url',
      'deal.id as deal_id',
      'deal.name as deal_name',
      'donation_project.id as donation_project_id',
      'donation_project.name as donation_project_name',
      'nonprofit_profile.first_name as nonprofit_first_name',
      'nonprofit_profile.last_name as nonprofit_last_name',
      'nonprofit_profile.foundation_name as foundation_name',
      'nonprofit_profile.foundation_url as foundation_url',
      'payment_currency.id as payment_currency_id',
      'payment_currency.name as payment_currency_name',
      'payment_currency.logo_uri as payment_currency_logo_uri',
    ])

    if (query?.donation_date?.start) {
      results.condition.andWhere(`to_char(data.created, 'YYYY-mm-dd') >= :start`, {
        start: query.donation_date.start,
      })
    }

    if (query?.donation_date?.end) {
      results.condition.andWhere(`to_char(data.created, 'YYYY-mm-dd') <= :end`, {
        end: query.donation_date.end,
      })
    }

    if (isExport) {
      const data: [] = await results.condition.getRawMany()

      if (!data.length) {
        throw new NotFoundException('No data to export')
      }

      const csvData: ICsvNonprofitPaymentDonor[] = data.map(this.toCSVDonorList)

      const csvExporter = new ExportToCsv({
        showLabels: true,
        useBom: true,
        useKeysAsHeaders: true,
      })

      return csvExporter.generateCsv(csvData, true)
    }

    return await this.rawPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
