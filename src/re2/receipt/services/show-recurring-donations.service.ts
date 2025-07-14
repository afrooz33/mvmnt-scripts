import { ExportToCsv } from 'export-to-csv'
import { PaginateRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { DonationType } from '@app/src/donations/enums'
import { SourceFilter } from '@app/src/re2/analytics/enums'
import { PAYMENT_STATUS } from '@app/src/users/payment/enums'
import { FundraiserType } from '@app/src/re2/fundraisers/enums'
import { RecurringDonationStatus } from '@app/src/re2/receipt/enums'
import { RecurringDonationsQueryDto } from '@app/src/re2/receipt/dto'

export default async function (
  query: RecurringDonationsQueryDto,
  userId: string,
): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.recurringDonationsRepository)
      .addRelation('user')
      .addRelation('user.profile')
      .addRelation('fundraiser')
      .create()

    results.condition.andWhere('"data"."fundraiserId" IS NOT NULL')

    results.condition.andWhere('"data"."reason" IN (:...reasons)', {
      reasons: [DonationType.FUNDRAISER_FORM, DonationType.FUNDRAISER_PAGE],
    })

    results.condition.andWhere('"fundraiser"."userId" = :userId', { userId })

    if (query?.source_filter === SourceFilter.FORM) {
      results.condition.andWhere('"fundraiser"."type" = :type', { type: FundraiserType.FORM })
    } else if (query?.source_filter === SourceFilter.PAGE) {
      results.condition.andWhere('"fundraiser"."type" = :type', { type: FundraiserType.PAGE })
    }

    if (query?.status === RecurringDonationStatus.CANCELLED) {
      results.condition.andWhere('"data"."is_active" = false')
    } else if (query?.status === RecurringDonationStatus.ON_GOING) {
      results.condition.andWhere('"data"."is_active" = true')
    }

    results.condition.select([
      `"data".id AS id`,
      `"data".created AS start_date`,
      `"data".donation_amount AS donation_amount`,
      `"data".is_active AS is_active`,
      `"user".display_name AS donor_name`,
      `"user".username AS donor_username`,
      `"profile".social_accounts AS donor_social_accounts`,
      `"fundraiser".public_url AS fundraiser_url`,

      // First and Last Payment Dates
      `(
        SELECT MIN("usage_date") 
        FROM "recurring_donation_signatures"
        WHERE "settingId" = "data".id
      ) AS first_payment_date`,

      `(
        SELECT MAX("usage_date")
        FROM "recurring_donation_signatures"
        WHERE "settingId" = "data".id
        AND "is_consumed" = true
      ) AS last_payment_date`,

      // Total Donations Count
      `(
        SELECT COUNT(*) 
        FROM "recurring_donation_signatures"
        WHERE "settingId" = "data".id
        AND "is_consumed" = true
      ) AS total_donations_count`,

      // Total Gross and Net Donations
      `(
        SELECT COALESCE(SUM("payment"."donation_amount"), 0)
        FROM "user_donation_payment" "payment"
        JOIN "recurring_donation_signatures" "signature" ON "signature"."paymentId" = "payment"."id"
        WHERE "signature"."settingId" = "data".id
        AND "payment"."status" IN ('${PAYMENT_STATUS.COMPLETED}', '${PAYMENT_STATUS.DONATION_SETTLED}')
      ) AS total_gross_donations`,

      `(
        SELECT COALESCE(SUM("payment"."donation_amount" - "payment"."gas_fees"), 0)
        FROM "user_donation_payment" "payment"
        JOIN "recurring_donation_signatures" "signature" ON "signature"."paymentId" = "payment"."id"
        WHERE "signature"."settingId" = "data".id
        AND "payment"."status" IN ('${PAYMENT_STATUS.COMPLETED}', '${PAYMENT_STATUS.DONATION_SETTLED}')
      ) AS total_net_donations`,

      // Next Upcoming Payment Date
      `(
        SELECT MIN("usage_date")
        FROM "recurring_donation_signatures"
        WHERE "settingId" = "data".id
        AND "is_consumed" = false
        AND "usage_date" > CURRENT_DATE
      ) AS next_donation_date`,
    ])

    if (query?.start_date?.leading_date && query?.start_date?.trailing_date) {
      results.condition.andWhere('"data"."created" BETWEEN :start_date AND :end_date', {
        start_date: query.start_date.leading_date,
        end_date: query.start_date.trailing_date,
      })
    } else if (query?.start_date?.leading_date) {
      results.condition.andWhere('"data"."created" >= :start_date', {
        start_date: query.start_date.leading_date,
      })
    } else if (query?.start_date?.trailing_date) {
      results.condition.andWhere('"data"."created" <= :end_date', {
        end_date: query.start_date.trailing_date,
      })
    }

    if (query?.keyword) {
      results.condition.andWhere(
        `(
          "fundraiser"."title" ILIKE :keyword
            OR "user"."display_name" ILIKE :keyword
            OR "user"."username" ILIKE :keyword
            OR "user"."email" ILIKE :keyword
        )`,
        {
          keyword: `%${query.keyword}%`,
        },
      )
    }

    if (query?.export === 'Yes') {
      const data = await results.condition.getRawMany()

      const csvData = data.map((item) => ({
        Id: item.id,
        Donor: item.donor_name,
        'Fundraiser URL': item.fundraiser_url,
        'Donation Status': item.donation_status,
        'Donation Started': item.first_payment_date,
        'Last Payment Date': item.last_payment_date,
        'Total Donations Count': item.total_donations_count,
        'Total Gross Donations': item.total_gross_donations,
        'Total Net Donations': item.total_net_donations,
        'Next Donation Date': item.next_donation_date,
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
