import { Not } from 'typeorm'
import { ExportToCsv } from 'export-to-csv'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { ErrorKey } from '@app/src/shared/enums'
import { AccountStatus } from '@app/src/nonprofit/user/enums'
import { DonationProjectStatus } from '@app/src/nonprofit/donation-projects/enums'
import { GetNonprofitDonationQuery, GetNonprofitProfileImageQuery } from '@app/src/shared/sql'

export default async function (id: string, isExport: boolean = false): Promise<any> {
  try {
    await this.documentExists({
      condition: [
        {
          where: {
            id,
            user: {
              account_status: Not(AccountStatus.DELETED),
            },
          },
          select: ['id'],
        },
      ],
      message: ErrorKey.NONPROFIT_PROFILE_NOT_FOUND,
    })

    const result: QueryBuilderDataInterface = new QueryBuilder({})
      .addFilter('id', id)
      .addRelation('user')
      .useQuery(this.adminNonprofitRepository)
      .create()

    result.condition.select([
      `"data"."id"`,
      `"data"."phone"`,
      `"user"."email"`,
      `"data"."status"`,
      `"data"."last_name"`,
      `"data"."first_name"`,
      `"data"."admin_memo"`,
      `"data"."introduction"`,
      `"user"."account_status"`,
      `"data"."foundation_url"`,
      `"data"."social_accounts"`,
      `"data"."foundation_name"`,
      `"data"."corporate_number"`,
      `"data"."notification_email"`,
      '"user"."id" as "nonprofit_id"',
      `${GetNonprofitProfileImageQuery('data')} as "profile_image"`,
      `(SELECT COUNT(*)::int FROM "donation_projects" WHERE "donation_projects"."userId" = "user"."id" AND "donation_projects"."status" IN ('${DonationProjectStatus.PUBLISHED}', '${DonationProjectStatus.TO_BE_CANCELLED}')) as "active_donation_projects"`,
      `(${GetNonprofitDonationQuery('"user"."id"', true)}) as "gross_donations"`,
      `(${GetNonprofitDonationQuery('"user"."id"')}) as "net_donations"`,
    ])

    if (isExport) {
      const data = await result.condition.getRawOne()

      const csvData = [
        {
          Email: data.email,
          'Profile Status': data.status,
          'First Name': data.first_name,
          'Last Name': data.last_name,
          'Account Status': data.account_status,
          'Foundation URL': data.foundation_url,
          'Foundation Name': data.foundation_name,
          'Total Donations': data.gross_donations,
          'Net Donations': data.net_donations,
          'Profile ID': data.id,
          'Nonprofit ID': data.nonprofit_id,
        },
      ]

      const csvExporter = new ExportToCsv({
        showLabels: true,
        useBom: true,
        useKeysAsHeaders: true,
        filename: `${data.foundation_name}.csv`,
      })

      return csvExporter.generateCsv(csvData, true)
    }

    return result.condition.getRawOne()
  } catch (error) {
    return HandleErrors(error)
  }
}
