import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { GetDealDonationQuery, GetUserDonationQuery } from '@app/src/shared/sql'
import { DonationType } from '@app/src/donations/enums'

export default async function (id: string) {
  try {
    const results: any = {
      donation_other: 0,
      direct_donation: 0,
      donation_me: 0,
      donation_re2: 0,
    }

    const other_donations = await this.entityManager.query(
      GetDealDonationQuery({ userId: id, isContribution: true }),
    )

    const me_donations = await this.entityManager.query(GetDealDonationQuery({ userId: id }))

    const direct_donations = await this.entityManager.query(
      GetDealDonationQuery({ userId: id, isDirect: true }),
    )

    if (other_donations.length > 0) {
      results.donation_other = other_donations[0].total_donation
    }

    if (me_donations.length > 0) {
      results.donation_me = me_donations[0].total_donation
    }

    if (direct_donations.length > 0) {
      results.direct_donation = direct_donations[0].total_donation
    }

    const re2_donations = await this.entityManager.query(
      GetUserDonationQuery({
        userId: id,
        reason: [
          DonationType.FUNDRAISER_FORM,
          DonationType.FUNDRAISER_PAGE,
          DonationType.INTEGRATION_CART_BANNER,
          DonationType.INTEGRATION_CART_DRAWER,
          DonationType.INTEGRATION_SALES_PORTION,
        ],
        select: 'COALESCE(SUM("donation"."amount"), 0) AS total_donation',
      }),
    )

    if (re2_donations.length > 0) {
      results.donation_re2 = re2_donations[0].total_donation
    }

    return results
  } catch (error) {
    return HandleErrors(error)
  }
}
