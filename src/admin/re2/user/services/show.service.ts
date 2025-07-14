import { ExportToCsv } from 'export-to-csv'
import { NotFoundException } from '@nestjs/common'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { PaginateRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import {
  GetRe2DonationQuery,
  GetTotalFundraisersQuery,
  GetTotalIntegrationsQuery,
  GetNetOrGrossDonationField,
} from '@app/src/shared/sql'
import { QueryDto } from '@app/src/admin/re2/user/dto'
import { DonationType } from '@app/src/donations/enums'
import { FundraiserStatus } from '@app/src/re2/fundraisers/enums'
import { IntegrationStatus } from '@app/src/re2/integrations/enums'

/**
 * Adds a condition to filter users based on fundraiser creation status.
 */
function addFundraiserCondition(
  results: QueryBuilderDataInterface,
  fundraiserStatus: FundraiserStatus[],
) {
  results.condition.andWhere(
    `"data"."id" IN (
      SELECT "userId" FROM "re2_fundraisers" 
      WHERE "re2_fundraisers"."userId" = "data"."id" 
      AND "re2_fundraisers"."status" NOT IN (:...fundraiser_status)
    )`,
    { fundraiser_status: fundraiserStatus },
  )
}

/**
 * Adds a condition to filter users based on integration creation status.
 */
function addIntegrationCondition(
  results: QueryBuilderDataInterface,
  integrationStatus: IntegrationStatus[],
) {
  results.condition.andWhere(
    `"data"."id" IN (
      SELECT "userId" FROM "re2_integrations" 
      WHERE "re2_integrations"."userId" = "data"."id" 
      AND "re2_integrations"."status" NOT IN (:...integration_status)
    )`,
    { integration_status: integrationStatus },
  )
}

export default async function (query: QueryDto, isExport = false): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.re2UserRepository)
      .addRelation(Query.PROFILE)
      .create()

    // Add conditions for fundraiser and integration creation
    if (query?.fundraiser_created) {
      addFundraiserCondition(results, [FundraiserStatus.DELETED])
    }

    if (query?.integration_created) {
      addIntegrationCondition(results, [IntegrationStatus.DELETED])
    }

    results.condition.select([
      'data.id id',
      'data.email email',
      'data.last_login last_login',
      'data.account_status account_status',
      'profile.id profile_id',
      'profile.first_name first_name',
      'profile.last_name last_name',
      'profile.company_name company_name',
      'data.created as registered_at',
      `(${GetRe2DonationQuery({
        re2Id: '"data"."id"',
        donationType: [
          DonationType.FUNDRAISER_FORM,
          DonationType.FUNDRAISER_PAGE,
          DonationType.INTEGRATION_CART_BANNER,
          DonationType.INTEGRATION_CART_DRAWER,
          DonationType.INTEGRATION_SALES_PORTION,
        ],
        select: `COALESCE(SUM(${GetNetOrGrossDonationField('donation', true)}), 0)::float`,
        isAll: true,
      })}) gross_donations`,
      `(${GetRe2DonationQuery({
        re2Id: '"data"."id"',
        donationType: [
          DonationType.FUNDRAISER_FORM,
          DonationType.FUNDRAISER_PAGE,
          DonationType.INTEGRATION_CART_BANNER,
          DonationType.INTEGRATION_CART_DRAWER,
          DonationType.INTEGRATION_SALES_PORTION,
        ],
        select: `COALESCE(SUM(${GetNetOrGrossDonationField('donation', false)}), 0)::float`,
        isAll: true,
      })}) net_donations`,
      `${GetTotalFundraisersQuery()} AS "total_fundraisers"`,
      `${GetTotalIntegrationsQuery()} AS "total_integrations"`,
    ])

    if (query?.total_donation_start) {
      results.condition.andWhere(`"gross_donations" >= :total_donation_start`, {
        total_donation_start: query.total_donation_start,
      })
    }

    if (query?.total_donation_end && query?.total_donation_start) {
      results.condition.andWhere(
        `(${GetRe2DonationQuery({
          re2Id: '"data"."id"',
          donationType: [
            DonationType.FUNDRAISER_FORM,
            DonationType.FUNDRAISER_PAGE,
            DonationType.INTEGRATION_CART_BANNER,
            DonationType.INTEGRATION_CART_DRAWER,
            DonationType.INTEGRATION_SALES_PORTION,
          ],
          select: `COALESCE(SUM(${GetNetOrGrossDonationField('donation', true)}), 0)::float`,
          isAll: true,
        })}) BETWEEN :total_donation_start AND :total_donation_end`,
        {
          total_donation_start: query.total_donation_start,
          total_donation_end: query.total_donation_end,
        },
      )
    } else if (query?.total_donation_start) {
      results.condition.andWhere(
        `(${GetRe2DonationQuery({
          re2Id: '"data"."id"',
          donationType: [
            DonationType.FUNDRAISER_FORM,
            DonationType.FUNDRAISER_PAGE,
            DonationType.INTEGRATION_CART_BANNER,
            DonationType.INTEGRATION_CART_DRAWER,
            DonationType.INTEGRATION_SALES_PORTION,
          ],
          select: `COALESCE(SUM(${GetNetOrGrossDonationField('donation', true)}), 0)::float`,
          isAll: true,
        })}) >= :total_donation_start`,
        {
          total_donation_start: query.total_donation_start,
        },
      )
    } else if (query?.total_donation_end) {
      results.condition.andWhere(
        `(${GetRe2DonationQuery({
          re2Id: '"data"."id"',
          donationType: [
            DonationType.FUNDRAISER_FORM,
            DonationType.FUNDRAISER_PAGE,
            DonationType.INTEGRATION_CART_BANNER,
            DonationType.INTEGRATION_CART_DRAWER,
            DonationType.INTEGRATION_SALES_PORTION,
          ],
          select: `COALESCE(SUM(${GetNetOrGrossDonationField('donation', true)}), 0)::float`,
          isAll: true,
        })}) <= :total_donation_end`,
        {
          total_donation_end: query.total_donation_end,
        },
      )
    }

    if (isExport) {
      const data: [] = await results.condition.getRawMany()

      if (!data.length) {
        throw new NotFoundException(ErrorKey.NO_CSV_DATA_FOUND)
      }

      const csvData = data.map((item: any) => {
        return {
          Id: item.id,
          Email: item.email,
          'Last login': item.last_login,
          'Account status': item.account_status,
          'First name': item.first_name,
          'Last name': item.last_name,
          'Company name': item.company_name,
          'Registered at': item.created,
          'Gross donations': item.gross_donations,
          'Net donations': item.net_donations,
          'Total fundraisers': item.total_fundraisers,
          'Total integrations': item.total_integrations,
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
