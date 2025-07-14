import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { GetUserDonationProjectDonationQuery } from '@app/src/shared/sql'
import { DonateTo } from '@app/src/donations/enums'

export default async function (id: string, source: DonateTo, userId: string) {
  try {
    const results: any = {
      total_donation: 0,
      total_donation_count: 0,
      user_donation_count: 0,
      user_donation_amount: 0,
    }

    let field = 'nonprofitId'
    let isNonprofit = true

    if (source === DonateTo.DONATION_PROJECT) {
      field = 'donationProjectId'
      isNonprofit = false
    }

    const total_donation = await this.entityManager.query(
      GetUserDonationProjectDonationQuery({
        isNonprofit,
        [field]: id,
        isAll: true,
        select: 'COALESCE(SUM("donation"."amount"), 0)::float AS total_donation',
      }),
    )

    const total_donation_count = await this.entityManager.query(
      GetUserDonationProjectDonationQuery({
        select: `COALESCE(COUNT(DISTINCT "donation"."id"), 0)::int AS total_donation_count`,
        isNonprofit,
        [field]: id,
        isAll: true,
      }),
    )

    if (total_donation.length > 0) {
      results.total_donation = total_donation[0].total_donation
    }

    if (total_donation_count.length > 0) {
      results.total_donation_count = total_donation_count[0].total_donation_count
    }

    if (userId) {
      const user_donation_count = await this.entityManager.query(
        GetUserDonationProjectDonationQuery({
          select: `COALESCE(COUNT(DISTINCT "donation"."id"), 0)::int AS user_donation_count`,
          isNonprofit,
          [field]: id,
          userId,
          isAll: true,
        }),
      )

      if (user_donation_count.length > 0) {
        results.user_donation_count = user_donation_count[0].user_donation_count
      }

      const user_donation_amount = await this.entityManager.query(
        GetUserDonationProjectDonationQuery({
          select: `COALESCE(SUM("donation"."amount"), 0)::float AS user_donation_amount`,
          isNonprofit,
          [field]: id,
          userId,
          isAll: true,
        }),
      )

      if (user_donation_amount.length > 0) {
        results.user_donation_amount = user_donation_amount[0].user_donation_amount
      }
    }

    return results
  } catch (error) {
    return HandleErrors(error)
  }
}
