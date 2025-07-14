import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { GetTotalRe2DonationQuery, GetNetOrGrossDonationField } from '@app/src/shared/sql'
import { DonationType } from '@app/src/donations/enums'
import { Re2AnalyticQueryDto } from '@app/src/re2/analytics/dto'
import { IntegrationStatus } from '@app/src/re2/integrations/enums'
import { FundraiserStatus, FundraiserType } from '@app/src/re2/fundraisers/enums'

export default async function (query: Re2AnalyticQueryDto, userId: string): Promise<any> {
  try {
    const total_donation = await this.entityManager.query(
      GetTotalRe2DonationQuery({
        re2: userId,
        isFundraiser: true,
        isIntegration: true,
        dateFilter: query.date_filter,
        select: `COALESCE(SUM(${GetNetOrGrossDonationField(
          'donation',
          true,
          true,
        )}), 0)::float donation_amount`,
      }),
    )

    const gross_donation = await this.entityManager.query(
      GetTotalRe2DonationQuery({
        re2: userId,
        isGross: true,
        isFundraiser: true,
        isIntegration: true,
        dateFilter: query.date_filter,
      }),
    )

    const net_donation = await this.entityManager.query(
      GetTotalRe2DonationQuery({
        re2: userId,
        isFundraiser: true,
        isIntegration: true,
        dateFilter: query.date_filter,
      }),
    )

    const total_donors = await this.entityManager.query(
      GetTotalRe2DonationQuery({
        re2: userId,
        isFundraiser: true,
        isIntegration: true,
        dateFilter: query.date_filter,
        select: `COUNT(DISTINCT "donation"."userId")::int donors`,
      }),
    )

    const total_fundraiser_form = await this.entityManager.query(`
      SELECT COUNT(DISTINCT "id")::int fundraisers
      FROM "re2_fundraisers"
      WHERE "userId" = '${userId}'
        AND "type" = '${FundraiserType.FORM}'
        AND "status" != '${FundraiserStatus.DELETED}'
    `)

    const total_fundraiser_page = await this.entityManager.query(`
      SELECT COUNT(DISTINCT "id")::int fundraisers
      FROM "re2_fundraisers"
      WHERE "userId" = '${userId}'
        AND "type" = '${FundraiserType.PAGE}'
        AND "status" != '${FundraiserStatus.DELETED}'
    `)

    const total_integrations = await this.entityManager.query(`
      SELECT COUNT(DISTINCT "id")::int integrations
      FROM "re2_integrations"
      WHERE "userId" = '${userId}' AND "status" != '${IntegrationStatus.DELETED}'
    `)

    const total_fundraiser_form_donation = await this.entityManager.query(
      GetTotalRe2DonationQuery({
        re2: userId,
        isFundraiser: true,
        reason: [DonationType.FUNDRAISER_FORM],
        dateFilter: query.date_filter,
      }),
    )

    const total_fundraiser_page_donation = await this.entityManager.query(
      GetTotalRe2DonationQuery({
        re2: userId,
        isFundraiser: true,
        reason: [DonationType.FUNDRAISER_PAGE],
      }),
    )

    const total_integration_donation = await this.entityManager.query(
      GetTotalRe2DonationQuery({
        re2: userId,
        isIntegration: true,
        dateFilter: query.date_filter,
        reason: [
          DonationType.INTEGRATION_CART_BANNER,
          DonationType.INTEGRATION_CART_DRAWER,
          DonationType.INTEGRATION_SALES_PORTION,
        ],
      }),
    )

    return {
      total_donors: total_donors[0]?.donors || 0,
      net_donation: net_donation[0]?.donation_amount || 0,
      gross_donation: gross_donation[0]?.donation_amount || 0,
      total_donation: total_donation[0]?.donation_amount || 0,
      total_integrations: total_integrations[0]?.integrations || 0,
      total_fundraiser_form: total_fundraiser_form[0]?.fundraisers || 0,
      total_fundraiser_page: total_fundraiser_page[0]?.fundraisers || 0,
      total_integration_donation: total_integration_donation[0]?.donation_amount || 0,
      total_fundraiser_form_donation: total_fundraiser_form_donation[0]?.donation_amount || 0,
      total_fundraiser_page_donation: total_fundraiser_page_donation[0]?.donation_amount || 0,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
