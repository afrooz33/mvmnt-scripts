import { ExportToCsv } from 'export-to-csv'
import { GetRe2DonationsQuery } from '@app/src/shared/sql'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { DonationType } from '@app/src/donations/enums'
import { Re2AnalyticQueryDto } from '@app/src/re2/analytics/dto'

export default async function (query: Re2AnalyticQueryDto, userId: string): Promise<any> {
  try {
    const total_donation = await this.entityManager.query(
      GetRe2DonationsQuery(
        [
          DonationType.FUNDRAISER_FORM,
          DonationType.FUNDRAISER_PAGE,
          DonationType.INTEGRATION_CART_BANNER,
          DonationType.INTEGRATION_CART_DRAWER,
          DonationType.INTEGRATION_SALES_PORTION,
        ],
        query,
        userId,
        ['total_donation', 'total_donor'],
      ),
    )

    if (query?.export === 'Yes') {
      const csvData = total_donation.map((item: any) => ({
        Source: 'Total Donation',
        Year: item.year,
        Month: item.month,
        Day: item.day || '',
        'Total Donation': item.total_donation,
        'Total Donor': item.total_donor,
      }))

      const csvExporter = new ExportToCsv({
        showLabels: true,
        useBom: true,
        useKeysAsHeaders: true,
        filename: `Summary Donations - ${query?.date_filter?.start} to ${query?.date_filter?.end}.csv`,
      })

      return csvExporter.generateCsv([...csvData], true)
    }

    return total_donation
  } catch (error) {
    return HandleErrors(error)
  }
}
