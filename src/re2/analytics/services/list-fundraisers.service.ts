import { ExportToCsv } from 'export-to-csv'
import { PaginateRO } from '@app/src/shared/dto'
import { GenerateDateRangeFilter } from '@app/src/shared/sql'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { DONATION_STATUS, DonationType } from '@app/src/donations/enums'
import { SourceFilter } from '@app/src/re2/analytics/enums'
import { Re2AnalyticQueryDto } from '@app/src/re2/analytics/dto'
import { FundraiserStatus, FundraiserType } from '@app/src/re2/fundraisers/enums'

export default async function (query: Re2AnalyticQueryDto, userId: string): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.fundraiserRepository)
      .addFilter('user', userId)
      .create()

    results.condition.andWhere(`"data"."status" NOT IN (:...fundraiser_status)`, {
      fundraiser_status: [FundraiserStatus.DELETED, FundraiserStatus.DRAFT],
    })

    let donationReason = `'${DonationType.FUNDRAISER_FORM}', '${DonationType.FUNDRAISER_PAGE}'`
    if (query?.source_filter === SourceFilter.FORM) {
      results.condition.andWhere(`"data"."type" = '${FundraiserType.FORM}'`)
      donationReason = `'${DonationType.FUNDRAISER_FORM}'`
    } else if (query?.source_filter === SourceFilter.PAGE) {
      results.condition.andWhere(`"data"."type" = '${FundraiserType.PAGE}'`)
      donationReason = `'${DonationType.FUNDRAISER_PAGE}'`
    }

    const date_query_condition = GenerateDateRangeFilter({
      query: {
        date_filter: {
          start: query?.date_filter?.start,
          end: query?.date_filter?.end,
        },
      },
      field: 'created',
      alias: 'donation',
      condition: ' AND ',
    })

    results.condition.leftJoinAndSelect(
      `(SELECT 
          "payment"."reference_id",
          COUNT(DISTINCT "donation"."userId") AS contributors,
          COALESCE(SUM("donation".amount), 0) AS gross_donation,
          COALESCE(SUM("donation".amount - "donation"."system_fees"), 0) AS net_donation,
          MAX("donation".created) AS last_donation
        FROM "user_donations" "donation"
        JOIN "user_donation_payment" "payment" 
        ON "payment"."id" = "donation"."userDonationPaymentId"
        WHERE "donation"."reason" IN (${donationReason})
        AND "donation"."status" IN ('${DONATION_STATUS.COMPLETED}', '${DONATION_STATUS.SETTLED}')
        ${date_query_condition}
        GROUP BY "payment"."reference_id"
      )`,
      'donations',
      '"donations"."reference_id" = "data"."id"',
    )

    results.condition.select([
      'data.id id',
      'data.type type',
      'data.title title',
      'donations.contributors',
      'donations.gross_donation',
      'donations.net_donation',
      'donations.last_donation',
    ])

    if (query?.export === 'Yes') {
      const data = await results.condition.getRawMany()

      const csvData = data.map((item) => ({
        Id: item.id,
        Type: item.type,
        Title: item.title,
        Contributors: item.contributors,
        'Gross Donation': item.gross_donation,
        'Net Donation': item.net_donation,
        'Last Donation': item.last_donation,
      }))

      const csvExporter = new ExportToCsv({
        showLabels: true,
        useBom: true,
        useKeysAsHeaders: true,
      })

      return csvExporter.generateCsv(csvData, true)
    }

    results.condition.orderBy('"donations"."last_donation"', 'DESC')

    return await this.rawPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
