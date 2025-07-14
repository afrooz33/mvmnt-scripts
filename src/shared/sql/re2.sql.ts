import { isArray, isUUID } from 'class-validator'
import { IGetRe2SourceDonationArgs, IRe2QueryArgs } from '@app/src/shared/interfaces'
import { GetDaysDifference, GetDateFilterRange } from '@app/src/shared/helpers/Date.helper'
import { IntegrationStatus } from '@app/src/re2/integrations/enums'
import { DONATION_STATUS, DonationType } from '@app/src/donations/enums'
import { FundraiserStatus, FundraiserType } from '@app/src/re2/fundraisers/enums'
import {
  GenerateDateRangeFilter,
  CheckNonprofitDonationQuery,
  GetNetOrGrossDonationField,
} from './common.sql'

/**
 * Generates a subquery string for counting fundraisers based on their statuses.
 */
export function GetTotalFundraisersQuery(): string {
  return `(SELECT COALESCE(COUNT(*), 0)::int 
    FROM "re2_fundraisers" 
    WHERE "re2_fundraisers"."userId" = "data"."id" 
    AND "re2_fundraisers"."status" IN 
    ('${FundraiserStatus.CONFIRMED}', '${FundraiserStatus.ENABLED}', '${FundraiserStatus.PUBLISHED}')
  )`
}

/**
 * Generates a subquery string for counting integrations based on their statuses.
 */
export function GetTotalIntegrationsQuery(): string {
  return `(SELECT COALESCE(COUNT(*), 0)::int 
    FROM "re2_integrations" 
    WHERE "re2_integrations"."userId" = "data"."id" 
    AND "re2_integrations"."status" IN 
    ('${IntegrationStatus.ENABLED}')
  )`
}

/**
 * Generates a subquery string for counting donations based on their reasons.
 * @param args - The arguments for the query.
 * @param args.re2 - The RE2 ID, UUID or join alias.
 * @param args.dateFilter - The date filter.
 * @param args.select - The select for the query.
 * @param args.fundraiserType - The fundraiser type.
 * @param args.reason - The reason for the donations.
 * @param args.integrationType - The integration type.
 * @param args.isGross - Whether to use the gross amount.
 * @param args.reference - The reference for the donations.
 * @param args.isFundraiser - Whether to use the fundraiser.
 * @param args.isIntegration - Whether to use the integration.
 * @param args.shopifyIntegrationType - The shopify integration type.
 *
 * @returns A subquery string for counting donations based on their reasons.
 */
export function GetTotalRe2DonationQuery(args: IRe2QueryArgs): string {
  const {
    re2 = '',
    dateFilter,
    reason = [],
    isGross = false,
    reference = '',
    isFundraiser = false,
    isIntegration = false,
    select = `COALESCE(SUM(${GetNetOrGrossDonationField(
      'donation',
      isGross,
    )}), 0)::float donation_amount`,
  } = args

  const re2Id = isUUID(re2) ? `'${re2}'` : re2

  const dateCondition = GenerateDateRangeFilter({
    query: {
      date_filter: {
        start: dateFilter?.start,
        end: dateFilter?.end,
      },
    },
    field: 'created',
    alias: 'donation',
    condition: ' AND ',
  })

  let reasonCondition = `(
    '${DonationType.FUNDRAISER_FORM}',
    '${DonationType.FUNDRAISER_PAGE}',
    '${DonationType.INTEGRATION_CART_BANNER}',
    '${DonationType.INTEGRATION_CART_DRAWER}',
    '${DonationType.INTEGRATION_SALES_PORTION}'
  )`

  if (reason.length) {
    reasonCondition = isArray(reason)
      ? `(${reason.map((type) => `'${type}'`).join(',')})`
      : `('${reason}')`
  }

  let re2Condition = ''

  const fundraiserCondition = isFundraiser
    ? `SELECT "id" FROM "re2_fundraisers" WHERE "userId" = ${re2Id}`
    : ''
  const integrationConditions: string[] = []

  if (isIntegration) {
    integrationConditions.push(
      `SELECT "settings"."id" FROM "re2_shopify_cart_banner_settings" "settings"
       LEFT JOIN "re2_shopify_integrations" "shopify_integration" ON "settings"."shopifyIntegrationId" = "shopify_integration"."id"
       LEFT JOIN "re2_integrations" "integration" ON "shopify_integration"."integrationId" = "integration"."id"
       WHERE "integration"."userId" = ${re2Id}`,
    )

    integrationConditions.push(
      `SELECT "settings"."id" FROM "re2_shopify_cart_drawer_settings" "settings"
       LEFT JOIN "re2_shopify_integrations" "shopify_integration" ON "settings"."shopifyIntegrationId" = "shopify_integration"."id"
       LEFT JOIN "re2_integrations" "integration" ON "shopify_integration"."integrationId" = "integration"."id"
       WHERE "integration"."userId" = ${re2Id}`,
    )

    integrationConditions.push(
      `SELECT "settings"."id" FROM "re2_shopify_sale_portion_settings" "settings"
       LEFT JOIN "re2_shopify_integrations" "shopify_integration" ON "settings"."shopifyIntegrationId" = "shopify_integration"."id"
       LEFT JOIN "re2_integrations" "integration" ON "shopify_integration"."integrationId" = "integration"."id"
       WHERE "integration"."userId" = ${re2Id}`,
    )
  }

  const allConditions = [fundraiserCondition, ...integrationConditions].filter(Boolean)

  if (allConditions.length > 0) {
    re2Condition = `AND "payment"."reference_id" IN (${allConditions.join(' UNION ALL ')})`
  }

  const referenceCondition = reference ? `AND "payment"."reference_id" = '${reference}'` : ''

  return `(SELECT
      ${select}
    FROM "user_donations" "donation"
    LEFT JOIN "user_donation_payment" "payment" ON "donation"."userDonationPaymentId" = "payment"."id"
    WHERE "donation"."reason" IN ${reasonCondition}
      AND "donation"."status" IN ('${DONATION_STATUS.COMPLETED}', '${DONATION_STATUS.SETTLED}')
      ${dateCondition}
      ${re2Condition}
      ${referenceCondition}
  )`
}

export const DONATION_TYPES_MAP = {
  [DonationType.FUNDRAISER_FORM]: {
    table: 're2_fundraisers',
    condition: (type: string, userId: string) =>
      `SELECT "id" FROM "re2_fundraisers" WHERE "type" = '${type}' AND "userId" = ${userId}`,
  },
  [DonationType.FUNDRAISER_PAGE]: {
    table: 're2_fundraisers',
    condition: (type: string, userId: string) =>
      `SELECT "id" FROM "re2_fundraisers" WHERE "type" = '${type}' AND "userId" = ${userId}`,
  },
  [DonationType.INTEGRATION_CART_BANNER]: {
    table: 're2_shopify_cart_banner_settings',
    condition: (userId: string) =>
      GetRe2UserIntegrationQuery('re2_shopify_cart_banner_settings', userId),
  },
  [DonationType.INTEGRATION_CART_DRAWER]: {
    table: 're2_shopify_cart_drawer_settings',
    condition: (userId: string) =>
      GetRe2UserIntegrationQuery('re2_shopify_cart_drawer_settings', userId),
  },
  [DonationType.INTEGRATION_SALES_PORTION]: {
    table: 're2_shopify_sale_portion_settings',
    condition: (userId: string) =>
      GetRe2UserIntegrationQuery('re2_shopify_sale_portion_settings', userId),
  },
}

export function GetRe2UserIntegrationQuery(
  settingsTable: string,
  userId: string,
  select: string = '"settings"."id"',
): string {
  const userIdCondition = isUUID(userId) ? `'${userId}'` : userId

  return `SELECT
    ${select}
  FROM
    "${settingsTable}" "settings"
  LEFT JOIN "re2_shopify_integrations" "shopify_integration" 
    ON "settings"."shopifyIntegrationId" = "shopify_integration"."id"
  LEFT JOIN "re2_integrations" "integration" 
    ON "shopify_integration"."integrationId" = "integration"."id"
  WHERE "integration"."userId" = ${userIdCondition}`
}

interface DonationQueryConfig {
  orderBy: string
  leftJoin: string
  daySelect: string
  dayGroupBy: string
}

const GetQueryConfig = (daysDifference: number): DonationQueryConfig => {
  if (daysDifference <= 120) {
    return {
      dayGroupBy: 'DAY',
      daySelect: 'EXTRACT(DAY FROM date_series.dates) AS day,',
      orderBy: ', day',
      leftJoin: 'AND EXTRACT(DAY FROM "date_series"."dates") = grouped_donations.day',
    }
  }

  return {
    dayGroupBy: '',
    daySelect: '',
    orderBy: '',
    leftJoin: '',
  }
}

export function GetRe2DonationsQuery(
  sourceTypes: DonationType[],
  query,
  userId: string,
  selectFields: string[] = ['total_donation'],
): string {
  const { start, end } = GetDateFilterRange(query?.date_filter?.start, query?.date_filter?.end)
  const daysDifference = GetDaysDifference(start, end)
  const queryConfig = GetQueryConfig(daysDifference)
  const userIdCondition = isUUID(userId) ? `'${userId}'` : userId

  const unionConditions = sourceTypes.map((type) => {
    const typeConfig = DONATION_TYPES_MAP[type]
    return type.includes('FUNDRAISER')
      ? typeConfig.condition(
          type === DonationType.FUNDRAISER_FORM ? FundraiserType.FORM : FundraiserType.PAGE,
          userIdCondition,
        )
      : typeConfig.condition(userIdCondition)
  })

  const dynamicSelectFields = selectFields
    .map((field) => {
      if (field === 'total_donor') {
        return `COUNT(DISTINCT "ud"."userId") AS total_donor`
      } else if (field === 'total_donation') {
        return `SUM("ud"."amount") AS total_donation`
      } else {
        throw new Error(`Unsupported select field: ${field}`)
      }
    })
    .join(', ')

  const groupedQuery = `
    grouped_sales_donations AS (
      SELECT
        EXTRACT(YEAR FROM ud.created) AS year,
        EXTRACT(MONTH FROM ud.created) AS month,
        ${queryConfig.daySelect}
        ${dynamicSelectFields}
      FROM
        user_donations ud
      LEFT JOIN "user_donation_payment" "payment" ON "ud"."userDonationPaymentId" = "payment"."id"
      WHERE
        ud.reason IN (${sourceTypes.map((type) => `'${type}'`).join(',')})
        AND ud.created BETWEEN '${start}' AND '${end}'
        AND ud.status IN ('${DONATION_STATUS.SETTLED}', '${DONATION_STATUS.COMPLETED}')
        AND payment.reference_id IN (${unionConditions.join(' UNION ALL ')})
      GROUP BY
        EXTRACT(YEAR FROM ud.created),
        EXTRACT(MONTH FROM ud.created)
        ${queryConfig.daySelect}
    )
  `

  const finalSelectFields = selectFields
    .map((field) => `COALESCE(grouped_donations.${field}, 0) AS ${field}`)
    .join(', ')

  return `WITH date_series AS (
    SELECT generate_series(
      '${start}'::DATE,
      '${end}'::DATE,
      CASE 
        WHEN ('${end}'::date - '${start}'::date) <= 120 THEN '1 day'::interval
        ELSE '1 month'::interval
      END
    )::DATE AS dates
  ),
  ${groupedQuery}
  SELECT
    EXTRACT(YEAR FROM date_series.dates) AS year,
    EXTRACT(MONTH FROM date_series.dates) AS month,
    ${queryConfig.daySelect}
    ${finalSelectFields}
  FROM
    date_series
  LEFT JOIN
    grouped_sales_donations grouped_donations
  ON
    EXTRACT(YEAR FROM date_series.dates) = grouped_donations.year
    AND EXTRACT(MONTH FROM date_series.dates) = grouped_donations.month
    ${queryConfig.leftJoin}
  ORDER BY
    year, month${queryConfig.orderBy};`
}

export function GetRe2SourceDonationQuery(args: IGetRe2SourceDonationArgs): string {
  const {
    re2Id,
    dateFilter,
    nonprofitId,
    isDirect = false,
    select = 'COALESCE(SUM("donation"."amount" - "donation"."system_fees"), 0)',
  } = args

  const re2IdCondition = isUUID(re2Id) ? `'${re2Id}'` : re2Id
  const nonprofitIdCondition = isUUID(nonprofitId) ? `'${nonprofitId}'` : nonprofitId

  const dateCondition = GenerateDateRangeFilter({
    query: {
      date_filter: {
        start: dateFilter?.start,
        end: dateFilter?.end,
      },
    },
    field: 'created',
    alias: 'donation',
    condition: ' AND ',
  })

  return `SELECT ${select}
    FROM "user_donation_payment" "donation_payment"
    JOIN "user_donations" "donation" ON "donation"."userDonationPaymentId" = "donation_payment"."id"
    WHERE
      ${CheckNonprofitDonationQuery('"donation_payment"', nonprofitIdCondition, isDirect)}
      ${dateCondition}
    AND "donation_payment"."reference_id" IN (
      SELECT "id" FROM "re2_fundraisers" WHERE "userId" = ${re2IdCondition}
      UNION ALL
      SELECT "setting"."id" FROM "re2_shopify_sale_portion_settings" "setting"
      LEFT JOIN "re2_shopify_integrations" "shopify_integration" ON "shopify_integration"."id" = "setting"."shopifyIntegrationId"
      LEFT JOIN "re2_integrations" "integration" ON "integration"."id" = "shopify_integration"."integrationId"
      WHERE "integration"."userId" = ${re2IdCondition}
      UNION ALL
      SELECT "setting"."id" FROM "re2_shopify_cart_banner_settings" "setting"
      LEFT JOIN "re2_shopify_integrations" "shopify_integration" ON "shopify_integration"."id" = "setting"."shopifyIntegrationId"
      LEFT JOIN "re2_integrations" "integration" ON "integration"."id" = "shopify_integration"."integrationId"
      WHERE "integration"."userId" = ${re2IdCondition}
      UNION ALL
      SELECT "setting"."id" FROM "re2_shopify_cart_drawer_settings" "setting"
      LEFT JOIN "re2_shopify_integrations" "shopify_integration" ON "shopify_integration"."id" = "setting"."shopifyIntegrationId"
      LEFT JOIN "re2_integrations" "integration" ON "integration"."id" = "shopify_integration"."integrationId"
      WHERE "integration"."userId" = ${re2IdCondition}
    )`
}
