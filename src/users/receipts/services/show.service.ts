import { ExportToCsv } from 'export-to-csv'
import { PaginateRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { QueryDto } from '@app/src/users/receipts/dto'
import { DONATION_STATUS } from '@app/src/donations/enums'

export default async function showAuctionService(
  query: QueryDto,
  userId: string,
  isExport: boolean = false,
): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.userDonationsRepository)
      .addRelation('donation_project')
      .addFilter('user', userId)
      .create()

    results.condition.andWhere('"data"."status" IN (:...donation_status)', {
      donation_status: [DONATION_STATUS.COMPLETED],
    })

    if (query?.year) {
      results.condition.andWhere('EXTRACT(YEAR FROM "data"."created") = :year', {
        year: query.year,
      })
    }

    results.condition.select([
      'SUM("data"."amount") AS total_donation',
      '"donation_project"."userId" AS "nonprofit_id"',
      'MAX("data"."created") AS latest_donation_date',
      `(
        SELECT 
          JSON_BUILD_OBJECT(
            'id', "user"."id",
            'foundation_name', "profile"."foundation_name",
            'foundation_url', "profile"."foundation_url",
            'introduction', "profile"."introduction",
            'profile_image', "profile_image"."url"
          ) 
        FROM 
          "nonprofit_users" AS "user" 
          JOIN "nonprofit_profiles" AS "profile" ON "user"."id" = "profile"."userId" 
          JOIN "images" AS "profile_image" ON "profile"."profileImageId" = "profile_image"."id" 
        WHERE 
          "user"."id" = "donation_project"."userId" 
        LIMIT 
          1
      ) AS nonprofit_profile `,
    ])

    results.condition.groupBy('"donation_project"."userId"')

    results.condition.orderBy('latest_donation_date', 'DESC')

    if (query?.source_ids) {
      results.condition.andWhere('"donation_project"."userId" IN (:...source_ids)', {
        source_ids: Array.isArray(query.source_ids) ? query.source_ids : [query.source_ids],
      })
    }

    if (isExport) {
      const data: [] = await results.condition.getRawMany()

      if (!data.length) {
        return
      }

      const csvData = data.map((item: any) => {
        return {
          'Nonprofit ID': item.nonprofit_id,
          'Total Donation': item.total_donation,
          'Latest Donation Date': item.latest_donation_date,
          'Foundation Name': item.nonprofit_profile.foundation_name,
          'Foundation URL': item.nonprofit_profile.foundation_url,
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
