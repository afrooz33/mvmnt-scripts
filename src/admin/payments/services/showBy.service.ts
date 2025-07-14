import { PaginateRO } from '@app/src/shared/dto'
import { PreconditionFailedException } from '@nestjs/common'
import { Query } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { QueryDto } from '@app/src/admin/payments/dto'
import { DONATION_STATUS } from '@app/src/donations/enums'
import { DonationProjectStatus } from '@app/src/nonprofit/donation-projects/enums'

export default async function (query: QueryDto, month: string, year: string): Promise<PaginateRO> {
  try {
    if (parseInt(month) < 1 || parseInt(month) > 12) {
      throw new PreconditionFailedException('Month is not valid')
    }

    if (year.length !== 4) {
      throw new PreconditionFailedException('Year is not valid')
    }

    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.nonprofitUserRepository)
      .addRelation(Query.PROFILE)
      .addRelation(Query.NONPROFIT_PROFILE_IMAGE)
      .create()

    results.condition.andWhere(`("data"."id" IN (SELECT "nonprofitId"
        FROM "user_donations" "donations"
        WHERE "donations"."donationProjectId" = (SELECT "id" FROM "donation_projects" WHERE "userId" = "data"."id" AND "status" = '${
          DonationProjectStatus.DEFAULT
        }')
          AND "donations"."status" = '${DONATION_STATUS.COMPLETED}'
          AND to_char("donations"."created", 'YYYY/mm') = '${year}/${month
            .toString()
            .padStart(2, '0')}'
        GROUP BY "nonprofitId")
      OR "data"."id" IN (SELECT "donation_projects"."userId"
			  FROM "user_donations" "donations"
			  LEFT JOIN "donation_projects" ON "donation_projects"."id" = "donations"."donationProjectId"
			  WHERE "donation_projects"."userId" = "data"."id"
          AND "donations"."status" = '${DONATION_STATUS.COMPLETED}'
          AND "donations"."donationProjectId" IS NOT NULL
          AND to_char("donations"."created", 'YYYY/mm') = '${year}/${month
            .toString()
            .padStart(2, '0')}'
			  GROUP BY "donation_projects"."userId")
      )`)

    results.condition.leftJoinAndSelect(
      'data.bank_accounts',
      'bank_accounts',
      'bank_accounts.is_default = true',
    )

    results.condition.select([
      'data.id',
      'profile.first_name as first_name',
      'profile.last_name as last_name',
      'profile.foundation_name as foundation_name',
      'profile_image.url as profile_image',
      'bank_accounts.bank_name as bank_name',
      'bank_accounts.branch_code as branch_code',
      'bank_accounts.account_number as account_number',
      'bank_accounts.bank_account_type as bank_account_type',
      `(SELECT (
        SELECT COALESCE(SUM("donations"."amount" - "donations"."system_fees"), 0)::float
        FROM "user_donations" "donations"
        WHERE "donations"."donationProjectId" = (SELECT "id" FROM "donation_projects" WHERE "userId" = "data"."id" AND "status" = '${
          DonationProjectStatus.DEFAULT
        }')
          AND "donations"."status" = '${DONATION_STATUS.SETTLED}'
          AND to_char("donations"."created", 'YYYY/mm') = '${year}/${month
            .toString()
            .padStart(2, '0')}'
      ) + (
        SELECT COALESCE(SUM("donations"."amount" - "donations"."system_fees"), 0)::float
        FROM "user_donations" "donations"
        LEFT JOIN "donation_projects" ON "donation_projects"."id" = "donations"."donationProjectId"
        WHERE "donation_projects"."userId" = "data"."id"
          AND "donations"."status" = '${DONATION_STATUS.SETTLED}'
          AND "donations"."donationProjectId" IS NOT NULL
          AND to_char("donations"."created", 'YYYY/mm') = '${year}/${month
            .toString()
            .padStart(2, '0')}'
      )) AS total_donation`,
    ])

    return await this.rawPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
