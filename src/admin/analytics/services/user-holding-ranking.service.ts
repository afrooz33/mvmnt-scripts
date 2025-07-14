import { ExportToCsv } from 'export-to-csv'
import { SuccessRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { DateFilterQueryDto } from '@app/src/admin/analytics/dto'
import { GetNetOrGrossDonationField, GetUserDonationQuery } from '@app/src/shared/sql'

export default async function (
  query: DateFilterQueryDto,
  isExport: boolean = false,
): Promise<SuccessRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.walletBalanceRepository)
      .addRelation('payment_wallet')
      .addRelation('payment_wallet.user')
      .addRelation('user.profile')
      .addRelation('profile.profile_images')
      .create()

    results.condition.select([
      'COALESCE(SUM("data"."balance"), 0) AS balance',
      `JSON_BUILD_OBJECT(
        'id', "user"."id",
        'username', "user"."username",
        'display_name', "user"."display_name",
        'profile_image', "profile_images"."url",
        'social_accounts', "profile"."social_accounts"
      ) AS user`,
      `RANK() OVER (ORDER BY COALESCE(SUM("data"."balance"), 0) DESC) AS rank`,
      `(${GetUserDonationQuery({
        userId: '"user"."id"',
        isAll: true,
        select: `COALESCE(SUM(${GetNetOrGrossDonationField('donation', false)}), 0)`,
      })}) AS net_donations`,
      `(${GetUserDonationQuery({
        userId: '"user"."id"',
        isAll: true,
        select: `COALESCE(SUM(${GetNetOrGrossDonationField('donation', true)}), 0)`,
      })}) AS gross_donations`,
    ])

    if (query?.date_filter?.start && query?.date_filter?.end) {
      results.condition.andWhere('data.created BETWEEN :start AND :end', {
        start: query.date_filter.start,
        end: query.date_filter.end,
      })
    } else if (query?.date_filter?.start) {
      results.condition.andWhere('data.created >= :start', {
        start: query.date_filter.start,
      })
    } else if (query?.date_filter?.end) {
      results.condition.andWhere('data.created <= :end', {
        end: query.date_filter.end,
      })
    }

    results.condition.orderBy('rank', 'ASC')
    results.condition.groupBy('user.id, profile_images.url')

    results.condition.andWhere('"data"."balance" > 0')
    results.condition.andWhere('"user"."id" IS NOT NULL')

    if (isExport) {
      const data = await results.condition.getRawMany()

      const csvData = data.map((item) => ({
        Rank: item.rank,
        Balance: item.balance,
        Username: item.user.username,
        DisplayName: item.user.display_name,
        'Total Net Donations': item.net_donations,
        'Total Gross Donations': item.gross_donations,
      }))

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
