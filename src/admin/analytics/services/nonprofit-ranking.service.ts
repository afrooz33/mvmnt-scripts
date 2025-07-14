import { ExportToCsv } from 'export-to-csv'
import { PaginateRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { DONATION_STATUS, DonationType } from '@app/src/donations/enums'
import { AccountStatus } from '@app/src/nonprofit/user/enums'
import { MvmntDonationQueryDto } from '@app/src/admin/analytics/dto'
import { DonationProjectStatus } from '@app/src/nonprofit/donation-projects/enums'

function BuildDonationStatsQuery(
  donationProjectQuery: string,
  reasons: string[],
  statusFilter: string[] = [DONATION_STATUS.COMPLETED, DONATION_STATUS.SETTLED],
  additionalCondition: string = '',
): string {
  const statusFilterStr = statusFilter.map((status) => `'${status}'`).join(', ')

  const reasonFilter =
    reasons.length > 0
      ? `AND "donation"."reason" IN (${reasons.map((reason) => `'${reason}'`).join(', ')})`
      : ''

  return `SELECT
    JSON_BUILD_OBJECT(
      'gross_donations', COALESCE(SUM("donation"."amount" - "donation"."system_fees"), 0),
      'total_donors', COALESCE(COUNT(DISTINCT "donation"."userId"), 0)
    )
  FROM
    "user_donations" "donation"
  WHERE
    "donation"."status" IN (${statusFilterStr})
    ${reasonFilter}
    AND "donation"."donationProjectId" IN (${donationProjectQuery}${additionalCondition})`
}

export default async function (
  query: MvmntDonationQueryDto,
  isExport = false,
): Promise<PaginateRO> {
  try {
    const donationProjectQuery = `
      SELECT "id"
      FROM "donation_projects"
      WHERE "donation_projects"."userId" = "data"."id"
    `

    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.nonprofitUserRepository)
      .addRelation('profile')
      .addRelation('profile.profile_image')
      .addFilter('account_status', AccountStatus.DELETED, true)
      .create()

    results.condition.select([
      'data.id id',
      'data.account_status account_status',
      'profile_image.url profile_image',
      'profile.introduction introduction',
      'profile.foundation_url foundation_url',
      'profile.foundation_name foundation_name',
      `(${BuildDonationStatsQuery(
        donationProjectQuery,
        [],
        [DONATION_STATUS.COMPLETED, DONATION_STATUS.SETTLED],
      )}) as donations`,
      `(${BuildDonationStatsQuery(donationProjectQuery, [
        DonationType.BUYNOW,
        DonationType.AUCTION,
        DonationType.RAFFLE,
      ])}) as deal`,
      `(${BuildDonationStatsQuery(
        donationProjectQuery,
        [DonationType.DIRECT_DONATION],
        [DONATION_STATUS.COMPLETED, DONATION_STATUS.SETTLED],
        `AND "donation_projects"."status" = '${DonationProjectStatus.DEFAULT}'`,
      )}) as direct_donations`,
    ])

    results.condition.orderBy(
      `(
        SELECT COALESCE(SUM("donation"."amount"), 0)
        FROM "user_donations" "donation"
        WHERE "donation"."status" IN ('${DONATION_STATUS.COMPLETED}', '${DONATION_STATUS.SETTLED}')
        AND "donation"."donationProjectId" IN (${donationProjectQuery})
      )`,
      'DESC',
    )

    if (isExport) {
      const data: [] = await results.condition.getRawMany()

      const csvData = data.map((item: any) => {
        return {
          'Nonprofit Name': item.foundation_name,
          'Total Donations': item.donations.gross_donations,
          'Total Donors': item.donations.total_donors,
          'Total Deal Donations': item.deal.gross_donations,
          'Total Deal Donors': item.deal.total_donors,
          'Total Direct Donations': item.direct_donations.gross_donations,
          'Total Direct Donors': item.direct_donations.total_donors,
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
