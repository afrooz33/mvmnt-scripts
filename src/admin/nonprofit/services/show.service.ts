import { ExportToCsv } from 'export-to-csv'
import { Query } from '@app/src/shared/enums'
import { PaginateRO } from '@app/src/shared/dto'
import { GetNonprofitDonationQuery } from '@app/src/shared/sql'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { QueryDto } from '@app/src/admin/nonprofit/dto'
import { AccountStatus } from '@app/src/nonprofit/user/enums'

export default async function (query: QueryDto, isExport: boolean = false): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .addRelation(Query.USER)
      .useQuery(this.adminNonprofitRepository)
      .create()

    results.condition.select([
      `"user"."email"`,
      `"data"."status"`,
      `"data"."first_name"`,
      `"data"."last_name"`,
      `"user"."account_status"`,
      `"data"."foundation_url"`,
      `"data"."foundation_name"`,
      `"user"."id" as "nonprofit_id"`,
      `"data"."id" as "nonprofit_profile_id"`,
      `(${GetNonprofitDonationQuery('"user"."id"')}) as "total_donations"`,
    ])

    results.condition.andWhere('"user"."account_status" != :accountStatus', {
      accountStatus: AccountStatus.DELETED,
    })

    results.condition.orderBy(`(${GetNonprofitDonationQuery('"user"."id"')})`, 'DESC')

    if (query?.keyword) {
      results.condition.andWhere(
        `("data"."foundation_name" ILIKE :keyword OR "data"."foundation_url" ILIKE :keyword OR "user"."email" ILIKE :keyword OR "data"."first_name" ILIKE :keyword OR "data"."last_name" ILIKE :keyword)`,
        {
          keyword: `%${query.keyword}%`,
        },
      )
    }

    if (query?.total_donations?.start && query?.total_donations?.end) {
      results.condition.andWhere(
        `(${GetNonprofitDonationQuery('"user"."id"')}) BETWEEN :start AND :end`,
        {
          start: query.total_donations.start,
          end: query.total_donations.end,
        },
      )
    } else if (query?.total_donations?.start) {
      results.condition.andWhere(`(${GetNonprofitDonationQuery('"user"."id"')}) >= :start`, {
        start: query.total_donations.start,
      })
    } else if (query?.total_donations?.end) {
      results.condition.andWhere(`(${GetNonprofitDonationQuery('"user"."id"')}) <= :end`, {
        end: query.total_donations.end,
      })
    }

    if (isExport) {
      const data = await results.condition.getRawMany()

      const csvData = data.map((item) => {
        return {
          Email: item.email,
          'Profile Status': item.status,
          'First Name': item.first_name,
          'Last Name': item.last_name,
          'Account Status': item.account_status,
          'Foundation URL': item.foundation_url,
          'Foundation Name': item.foundation_name,
          'Total Donations': item.total_donations,
          'Profile ID': item.nonprofit_profile_id,
          'Nonprofit ID': item.nonprofit_id,
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
