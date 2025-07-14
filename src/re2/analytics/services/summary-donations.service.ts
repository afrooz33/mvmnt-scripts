import { ExportToCsv } from 'export-to-csv'
import { GetRe2DonationsQuery } from '@app/src/shared/sql'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { DonationType } from '@app/src/donations/enums'
import { Re2AnalyticQueryDto } from '@app/src/re2/analytics/dto'

const formatCsvData = (data: any[], source: string) => {
  return data.map((item: any) => ({
    Source: source,
    Year: item.year,
    Month: item.month,
    Day: item.day || '',
    'Total Donation': item.total_donation,
  }))
}

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
      ),
    )

    const form_donation = await this.entityManager.query(
      GetRe2DonationsQuery([DonationType.FUNDRAISER_FORM], query, userId),
    )

    const page_donation = await this.entityManager.query(
      GetRe2DonationsQuery([DonationType.FUNDRAISER_PAGE], query, userId),
    )

    const integration_donation = await this.entityManager.query(
      GetRe2DonationsQuery(
        [
          DonationType.INTEGRATION_CART_BANNER,
          DonationType.INTEGRATION_CART_DRAWER,
          DonationType.INTEGRATION_SALES_PORTION,
        ],
        query,
        userId,
      ),
    )

    if (query?.export === 'Yes') {
      const csvData = formatCsvData(total_donation, 'Total Donation')
      const form_csvData = formatCsvData(form_donation, 'Form Donation')
      const page_csvData = formatCsvData(page_donation, 'Page Donation')
      const integration_csvData = formatCsvData(integration_donation, 'Integration Donation')

      const csvExporter = new ExportToCsv({
        showLabels: true,
        useBom: true,
        useKeysAsHeaders: true,
        filename: `Summary Donations - ${query?.date_filter?.start} to ${query?.date_filter?.end}.csv`,
      })

      return csvExporter.generateCsv(
        [...csvData, ...form_csvData, ...page_csvData, ...integration_csvData],
        true,
      )
    }

    return {
      total_donation,
      form_donation,
      page_donation,
      integration_donation,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
