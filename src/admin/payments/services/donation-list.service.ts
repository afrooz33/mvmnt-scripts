import { ExportToCsv } from 'export-to-csv'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { PaginateRO } from '@app/src/shared/dto'
import { DonationStatus } from '@app/src/donations/enums'
import { TopStatQueryDto } from '@app/src/admin/payments/dto'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'

export default async function (query: TopStatQueryDto, isExport = false): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .addFilter('status', DonationStatus.SUCCESS)
      .addRelation('deal')
      .addRelation('donor')
      .addRelation('donor.profile')
      .addRelation('donation_project')
      .addRelation('nonprofit')
      .useQuery(this.donationsRepository)
      .create()

    results.condition.select([
      'deal.id',
      'deal.name',
      'data.amount',
      'donor.username',
      'donor.display_name',
      'deal.deal_type',
      'data.net_amount',
      'donor.account_type',
      'donation_project.name',
      'data.created as payment_date',
      'data.transfer_status as payment_status',
      'profile.social_accounts as social_accounts',
      '(data.amount - data.net_amount) as admin_margin',
    ])

    if (query?.donation_date?.start) {
      results.condition.andWhere('"data"."created" >= :start', {
        start: query.donation_date.start,
      })
    }

    if (query?.donation_date?.end) {
      results.condition.andWhere('"data"."created" >= :end', {
        end: query.donation_date.end,
      })
    }

    results.condition.addGroupBy([
      `"data"."id"`,
      `"deal"."id"`,
      `"donor"."id"`,
      `"profile"."id"`,
      `"nonprofit"."id"`,
      `"donation_project"."id"`,
    ])

    results.condition.orderBy({ '"data"."created"': 'DESC' })

    if (isExport) {
      const data: [] = await results.condition.getRawMany()

      const csvData: any = data.map((item: any) => {
        return {
          'Donation amount': item.data_amount,
          'Net donation amount': item.data_net_amount,
          'Deal type': item.deal_deal_type,
          'Deal name': item.deal_name,
          'Donor username': item.donor_username,
          'Donor name': item.donor_display_name,
          'Donor account type': item.donor_account_type,
          'Donation project name': item.donation_project_name,
          'Payment date': item.payment_date,
          'Payment status': item.payment_status,
          'Admin margin': item.admin_margin,
        }
      })

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
