import { isArray, isUUID } from 'class-validator'
import {
  IUserDonation,
  IGetDealStatsQueryArgs,
  IDealDonationQueryArgs,
  IGetRe2DonationQueryArgs,
  IGetDealPurchaseQueryArgs,
  IGetUserDealSalesQueryArgs,
  IGetTotalDealSalesQueryArgs,
  IGenerateDateRangeFilterArgs,
  IGroupedParticipantQueryArgs,
  IUserDonationProjectDonationQueryArgs,
} from '@app/src/shared/interfaces'
import { DealStatus } from '@app/src/users/deal/enums'
import { DONATION_STATUS, DonationType } from '@app/src/donations/enums'
import { DONATION_SOURCE, PAYMENT_STATUS } from '@app/src/users/payment/enums'
import { DonationProjectStatus } from '@app/src/nonprofit/donation-projects/enums'
import { CartStatus } from '@app/src/users/deal/buynow/enums'
import { WishlistStatus } from '@app/src/users/wishlist/enums'

const removeDoubleQuotes = (alias: string) => {
  if (alias.includes('"')) {
    alias = alias.replace(/"/g, '')
  }

  return alias
}

type DateFilterRange = {
  leading_date?: string | Date
  trailing_date?: string | Date
}

type BuildDateFilterArgs = {
  dateType: 'start' | 'end'
  range: DateFilterRange
  paramKeyPrefix: string
}

interface ReasonDateEntry {
  reasons: DonationType[]
  conditionSql: (fieldOps: string) => string
}

export function GenerateDateRangeFilter(args: IGenerateDateRangeFilterArgs): string {
  const { query, alias, field, condition, isAppend } = args

  let final_sql = ''
  const column = alias ? `"${alias}"."${field}"` : `"${field}"`
  const condition_string = condition ? condition : ''

  if (query?.date_filter?.start && query?.date_filter?.end) {
    final_sql = `${isAppend ? final_sql : ''}${condition_string}${column} BETWEEN '${
      query.date_filter.start
    }' AND '${query.date_filter.end}'`
  } else if (query?.date_filter?.start) {
    final_sql = `${isAppend ? final_sql : ''}${condition_string}${column} >= '${
      query.date_filter.start
    }'`
  } else if (query?.date_filter?.end) {
    final_sql = `${isAppend ? final_sql : ''}${condition_string}${column} <= '${
      query.date_filter.end
    }'`
  }

  return final_sql
}

export function GetDonationProjectDonationQuery(
  alias: string = 'data',
  select: string = 'COALESCE(SUM("donation"."amount"), 0)',
  donation_reason: string[] = [],
): string {
  alias = removeDoubleQuotes(alias)

  const conditions = []

  if (donation_reason.length) {
    conditions.push(
      `"donation"."reason" IN (${donation_reason.map((reason) => `'${reason}'`).join(',')})`,
    )
  }

  const where = conditions.length ? ` AND ${conditions.join(' AND ')}` : ''

  return `SELECT ${select}
    FROM
      "user_donations" AS "donation"
    WHERE
      "donation"."donationProjectId" = "${alias}"."id"
        AND "donation"."status" IN ('${DONATION_STATUS.COMPLETED}', '${DONATION_STATUS.SETTLED}')
        ${where}
  `.trim()
}

/**
 * Check the nonprofit donation query
 * @param alias - The alias of the donation table
 * @param nonprofitId - The nonprofit id
 * @param isDirect - Whether the donation is direct
 * @returns The nonprofit donation query
 */
export function CheckNonprofitDonationQuery(
  alias: string = 'data',
  nonprofitId: string,
  isDirect: boolean = false,
  isAll: boolean = false,
): string {
  alias = removeDoubleQuotes(alias)

  const nonprofitIdCondition = isUUID(nonprofitId) ? `'${nonprofitId}'` : nonprofitId
  const where = ` AND "status" ${isDirect ? '=' : '!='} '${DonationProjectStatus.DEFAULT}'`

  if (isAll) {
    return `"${alias}"."donationProjectId" IN (
      SELECT
        "id"
      FROM
        "donation_projects"
      WHERE "userId" = ${nonprofitIdCondition}
    )`.trim()
  }

  return `"${alias}"."donationProjectId" IN (
    SELECT
      "id"
    FROM
      "donation_projects"
    WHERE "userId" = ${nonprofitIdCondition}${where}
  )`.trim()
}

export function GetDealDonationQuery(args: IDealDonationQueryArgs): string {
  const {
    select = 'COALESCE(SUM("donation"."amount"), 0) AS "total_donation"',
    userId,
    dealId,
    isDirect = false,
    columnMatchCondition,
    isContribution = false,
  } = args

  const whereClauses: string[] = [
    `"donation"."status" IN ('${DONATION_STATUS.COMPLETED}', '${DONATION_STATUS.SETTLED}')`,
  ]
  const joinClause: string[] = []

  joinClause.push(`LEFT JOIN "user_deal_item_payment" "payment" 
    ON "donation"."userDealItemPaymentId" = "payment"."id"`)

  if (columnMatchCondition) {
    whereClauses.push(columnMatchCondition)
  }

  if (userId) {
    const userIdCondition = isUUID(userId) ? `'${userId}'` : userId

    whereClauses.push(`"donation"."userId" = ${userIdCondition}`)
  }

  if (isDirect) {
    whereClauses.push(`"donation"."reason" = '${DonationType.DIRECT_DONATION}'`)
  }

  if (dealId) {
    const dealCondition = isUUID(dealId) ? `'${dealId}'` : dealId

    whereClauses.push(`"payment"."dealId" = ${dealCondition}`)
  }

  if (isContribution) {
    whereClauses.push(
      `("payment"."senderId" = '${userId}' OR "payment"."receiverId" = '${userId}')`,
    )
  }

  return `
    SELECT ${select}
    FROM "user_donations" "donation"
    ${joinClause.join('\n')}
    WHERE ${whereClauses.join(' AND ')}
  `
}

export function GetUserDonationQuery(args: IUserDonation): string {
  const {
    select = 'COALESCE(SUM("donation"."amount"), 0)',
    reason = [],
    userId,
    dealId,
    isAll = false,
    isDirect = false,
    isContribution = false,
  } = args

  const whereClauses: string[] = [
    `"donation"."status" IN ('${DONATION_STATUS.COMPLETED}', '${DONATION_STATUS.SETTLED}')`,
  ]

  const joinClause: string[] = []

  joinClause.push(`LEFT JOIN "user_deal_item_payment" "payment" 
    ON "donation"."userDealItemPaymentId" = "payment"."id"`)

  if (isAll) {
    joinClause.push(`LEFT JOIN "user_donation_payment" "donation_payment" 
      ON "donation"."userDonationPaymentId" = "donation_payment"."id"`)
  }

  if (userId) {
    const userIdCondition = isUUID(userId) ? `'${userId}'` : userId

    whereClauses.push(`"donation"."userId" = ${userIdCondition}`)
  }

  if (dealId) {
    const dealCondition = isUUID(dealId) ? `'${dealId}'` : dealId

    whereClauses.push(`"payment"."dealId" = ${dealCondition}`)
  }

  if (isDirect) {
    whereClauses.push(`"donation_payment"."source" = '${DONATION_SOURCE.DIRECT}'`)
  }

  if (isContribution) {
    whereClauses.push(
      `("payment"."senderId" = '${userId}' OR "payment"."receiverId" = '${userId}')`,
    )
  }

  if (reason && reason.length) {
    const reasonCondition = isArray(reason)
      ? reason.map((type) => `'${type}'`).join(',')
      : `'${reason}'`

    whereClauses.push(`"donation"."reason" IN (${reasonCondition})`)
  }

  return `
    SELECT ${select}
    FROM "user_donations" "donation"
    ${joinClause.join('\n')}
    WHERE ${whereClauses.join(' AND ')}
  `
}

export function GetUserDonationProjectDonationQuery(
  args: IUserDonationProjectDonationQueryArgs,
): string {
  const {
    select = 'COALESCE(SUM("donation"."amount"), 0)',
    userId,
    isDirect = false,
    donationProjectId,
    isNonprofit = false,
    nonprofitId,
    query,
    reason = [],
    isAll = false,
  } = args

  const whereClauses: string[] = [
    `"donation"."status" IN ('${DONATION_STATUS.COMPLETED}', '${DONATION_STATUS.SETTLED}')`,
  ]

  if (donationProjectId) {
    whereClauses.push(`"donation"."donationProjectId" = '${donationProjectId}'`)
  }

  if (isNonprofit && !isAll && !nonprofitId) {
    whereClauses.push(CheckNonprofitDonationQuery('donation', userId, isDirect))
  } else if (isNonprofit && !isAll && nonprofitId) {
    whereClauses.push(CheckNonprofitDonationQuery('donation', nonprofitId, true))
  } else if (isNonprofit && isAll && nonprofitId) {
    whereClauses.push(CheckNonprofitDonationQuery('donation', nonprofitId, false, true))
  }

  if (userId && userId !== 'undefined') {
    whereClauses.push(`"donation"."userId" = '${userId}'`)
  }

  if (isDirect) {
    whereClauses.push(`"donation"."reason" = '${DonationType.DIRECT_DONATION}'`)
  }

  if (reason && reason.length) {
    const reasonCondition = isArray(reason)
      ? reason.map((type) => `'${type}'`).join(',')
      : `'${reason}'`

    whereClauses.push(`"donation"."reason" IN (${reasonCondition})`)
  }

  const dateCondition = GenerateDateRangeFilter({
    query: {
      date_filter: {
        start: query?.date_filter?.start,
        end: query?.date_filter?.end,
      },
    },
    field: 'created',
    alias: 'donation',
    condition: ' AND ',
  })

  return `
    SELECT ${select}
    FROM "user_donations" "donation"
    WHERE ${whereClauses.join(' AND ')}
    ${dateCondition}
  `
}

export function GetTotalDealSalesQuery(args: IGetTotalDealSalesQueryArgs): string {
  const {
    select = 'COALESCE(SUM("payment"."deal_amount"), 0)',
    userId,
    dealId,
    groupBy,
    dealType,
    isContribution = false,
  } = args

  const groupByClause = groupBy ? `GROUP BY ${groupBy}` : ''

  const whereClauses = [
    `"payment"."status" IN ('${PAYMENT_STATUS.COMPLETED}', '${PAYMENT_STATUS.DONATION_SETTLED}')`,
  ]

  if (userId) {
    const userIdCondition = isUUID(userId) ? `'${userId}'` : userId

    whereClauses.push(`"payment"."userId" = ${userIdCondition}`)
  }

  if (dealId) {
    const dealCondition = isUUID(dealId) ? `'${dealId}'` : dealId

    whereClauses.push(`"item_payment"."dealId" = ${dealCondition}`)
  }

  if (dealType) {
    const dealTypeCondition = isArray(dealType)
      ? dealType.map((type) => `'${type}'`).join(',')
      : `'${dealType}'`

    whereClauses.push(`"payment"."deal_type" IN (${dealTypeCondition})`)
  }

  if (isContribution) {
    whereClauses.push(
      `("item_payment"."senderId" = '${userId}' OR "item_payment"."receiverId" = '${userId}')`,
    )
  }

  return `
    SELECT ${select}
    FROM "user_deal_item_payment" "item_payment"
    LEFT JOIN "user_deal_payment" "payment"
      ON "payment"."id" = "item_payment"."paymentId"
    WHERE
      ${whereClauses.join(' AND ')}
    ${groupByClause}
  `
}

export function GetDealStatsQuery(args: IGetDealStatsQueryArgs): string {
  const {
    select = `
      "deals"."userId",
      COALESCE(SUM("donations"."amount" - "donations"."system_fees"), 0) AS "total_net_donations",
      COALESCE(SUM("donations"."amount" + "donations"."system_fees"), 0) AS "total_donations",
      COUNT(DISTINCT "deals"."id") AS "total_deals_sold",
    COALESCE(SUM("payment"."total_amount"), 0) AS "highest_selling_amount"
  `,
    userId,
    dealId,
    dealType,
    dateFilter,
    columnMatchCondition = '',
    additionalJoins = '',
    additionalWhere = '',
  } = args

  const dateCondition = GenerateDateRangeFilter({
    query: {
      date_filter: {
        start: dateFilter?.start,
        end: dateFilter?.end,
      },
    },
    field: 'created',
    alias: 'donations',
    condition: ' AND ',
  })

  let specificConditions = ''
  if (userId) {
    const userIdCondition = isUUID(userId) ? `'${userId}'` : userId

    specificConditions += ` AND "deals"."userId" = ${userIdCondition}`
  }
  if (dealId) {
    const dealIdCondition = isUUID(dealId) ? `'${dealId}'` : dealId

    specificConditions += ` AND "deals"."id" = ${dealIdCondition}`
  }
  if (dealType) {
    const dealTypeCondition = isArray(dealType)
      ? dealType.map((type) => `'${type}'`).join(',')
      : `'${dealType}'`

    specificConditions += ` AND "deals"."deal_type" IN (${dealTypeCondition})`
  }

  return `
    SELECT 
      ${select}
    FROM "deals"
    LEFT JOIN "user_deal_item_payment" "payment"
      ON "payment"."dealId" = "deals"."id"
    LEFT JOIN "user_donations" "donations"
      ON "donations"."userDealItemPaymentId" = "payment"."id"
    ${additionalJoins}
    WHERE "deals"."status" NOT IN ('${DealStatus.DRAFT}', '${DealStatus.DELETED}')
    ${dateCondition}
    ${specificConditions}
    ${columnMatchCondition}
    ${additionalWhere}
    GROUP BY "deals"."userId"
  `
}

export function GetDealSalePurchaseQuery(args: IGetDealPurchaseQueryArgs): string {
  const {
    select = 'COALESCE(SUM("item_payment"."deal_amount"), 0)',
    userId,
    dealId,
    dealType,
    dateFilter,
  } = args

  const whereClauses: string[] = []
  const leftJoinClause: string[] = []

  leftJoinClause.push(`LEFT JOIN "user_deal_payment" "payment" 
    ON "payment"."id" = "item_payment"."paymentId"`)

  whereClauses.push(
    `"payment"."status" IN ('${PAYMENT_STATUS.COMPLETED}', '${PAYMENT_STATUS.DONATION_SETTLED}')`,
  )

  if (dealType) {
    const dealTypeCondition = isArray(dealType)
      ? dealType.map((type) => `'${type}'`).join(',')
      : `'${dealType}'`

    whereClauses.push(`"payment"."deal_type" IN (${dealTypeCondition})`)
  }

  if (userId) {
    const userIdCondition = isUUID(userId) ? `'${userId}'` : userId

    whereClauses.push(`"payment"."userId" = ${userIdCondition}`)
  }

  if (dealId) {
    const dealCondition = isUUID(dealId) ? `'${dealId}'` : dealId

    whereClauses.push(`"item_payment"."dealId" = ${dealCondition}`)
  }

  const dateCondition = GenerateDateRangeFilter({
    query: {
      date_filter: {
        start: dateFilter?.start,
        end: dateFilter?.end,
      },
    },
    field: 'created',
    alias: 'payment',
    condition: ' AND ',
  })

  return `
    SELECT ${select}
    FROM "user_deal_item_payment" "item_payment"
    ${leftJoinClause.join('\n')}
    WHERE ${whereClauses.join(' AND ')}
    ${dateCondition}
  `
}

export function GetUserDealSalesQuery(args: IGetUserDealSalesQueryArgs): string {
  const {
    userId,
    dealType,
    isPurchase = false,
    select = 'COALESCE(SUM("item_payment"."deal_amount"), 0)',
  } = args

  let user = removeDoubleQuotes(userId)

  user = isUUID(userId) ? `'${userId}'` : userId

  const leftJoinClause: string[] = []
  const whereClauses: string[] = [
    `"item_payment"."status" IN ('${PAYMENT_STATUS.COMPLETED}', '${PAYMENT_STATUS.DONATION_SETTLED}')`,
  ]

  if (dealType) {
    leftJoinClause.push(`LEFT JOIN "deals" "deal" 
      ON "deal"."id" = "item_payment"."dealId"`)

    whereClauses.push(`"deal"."deal_type" IN (${dealType.map((type) => `'${type}'`).join(',')})`)

    if (!isPurchase) {
      whereClauses.push(`"deal"."userId" = ${user}`)
    }
  }

  if (isPurchase) {
    leftJoinClause.push(`LEFT JOIN "user_deal_payment" "payment" 
      ON "payment"."id" = "item_payment"."paymentId"`)

    whereClauses.push(`"payment"."userId" = ${user}`)
  }

  return `SELECT ${select}
    FROM "user_deal_item_payment" "item_payment"
    ${leftJoinClause.join('\n')}
    WHERE ${whereClauses.join(' AND ')}`
}

export function GenerateGroupedParticipantQuery(args: IGroupedParticipantQueryArgs): string {
  const { name, table, alias, filters, groupBy, dealType, dateRange, dateColumn, selectFields } =
    args

  const whereClauses = [
    `"${alias}"."deal_type" = '${dealType}'`,
    `"${alias}"."${dateColumn}" BETWEEN '${dateRange.start}' AND '${dateRange.end}'`,
    ...filters,
  ].join(' AND ')

  const groupByExtracts = groupBy
    .map((col) => `EXTRACT(${col} FROM "${alias}"."${dateColumn}") AS "${col.toLowerCase()}"`)
    .join(', ')

  const fullGroupBy = [groupByExtracts]
    .filter(Boolean)
    .join(', ')
    .replace(/ AS "[^"]*"/g, '')

  return `${name} AS (
    SELECT
      ${groupByExtracts},
      ${selectFields.join(',\n')}
    FROM
      "${table}" "${alias}"
    WHERE
      ${whereClauses}
    GROUP BY
      ${fullGroupBy}
  )`
}

export function GetRe2DonationQuery(args: IGetRe2DonationQueryArgs): string {
  const {
    id,
    re2Id,
    donationType,
    isAll = false,
    select = 'COALESCE(SUM("donation"."amount"), 0)',
  } = args

  const donationTypeCondition = isArray(donationType)
    ? donationType.map((type) => `'${type}'`).join(',')
    : `'${donationType}'`

  const whereClauses = [
    `"donation"."reason" IN (${donationTypeCondition})`,
    `"donation"."status" IN ('${DONATION_STATUS.COMPLETED}', '${DONATION_STATUS.SETTLED}')`,
  ]

  if (isAll) {
    const re2IdCondition = isUUID(re2Id) ? `'${re2Id}'` : re2Id

    whereClauses.push(
      `"payment"."reference_id" IN (
        SELECT "id" FROM "re2_integrations" WHERE "userId" = ${re2IdCondition}
        UNION
        SELECT "id" FROM "re2_fundraisers" WHERE "userId" = ${re2IdCondition}
      )`,
    )
  } else {
    const idCondition = isUUID(id) ? `'${id}'` : id

    whereClauses.push(`"payment"."reference_id" = ${idCondition}`)
  }

  return `SELECT ${select} FROM "user_donations" "donation"
    LEFT JOIN "user_donation_payment" "payment"
      ON "payment"."id" = "donation"."userDonationPaymentId"
    WHERE ${whereClauses.join(' AND ')}`
}

export function BuildDateFilterCondition(args: BuildDateFilterArgs): {
  sql: string | null
  params: Record<string, any>
} {
  const { dateType, range, paramKeyPrefix } = args

  if (!range.leading_date && !range.trailing_date) {
    return { sql: null, params: {} }
  }

  const dealField = dateType === 'start' ? `"deal"."start_date"` : `"deal"."end_date"`
  const fundraiserField = dateType === 'start' ? `f."start_date"` : `f."end_date"`

  const shopifyField = `si."created"`

  function buildFieldOps(): { snippet: string; paramEntries: Record<string, any> } {
    const parts: string[] = []
    const paramEntries: Record<string, any> = {}

    if (range.leading_date) {
      const paramName = `${paramKeyPrefix}_leading`
      parts.push(`${/*FIELD*/ '__FIELD__'} >= :${paramName}`)
      paramEntries[paramName] = range.leading_date
    }

    if (range.trailing_date) {
      const paramName = `${paramKeyPrefix}_trailing`
      parts.push(`${/*FIELD*/ '__FIELD__'} <= :${paramName}`)
      paramEntries[paramName] = range.trailing_date
    }

    const combined = parts.join(' AND ')
    return { snippet: combined, paramEntries }
  }

  const { snippet: baseOps, paramEntries } = buildFieldOps()

  if (!baseOps) {
    return { sql: null, params: {} }
  }

  const dateEntries: ReasonDateEntry[] = [
    {
      reasons: [DonationType.BUYNOW, DonationType.RAFFLE, DonationType.AUCTION],
      conditionSql: (fieldOps: string) => fieldOps.replace(/__FIELD__/g, dealField),
    },
    {
      reasons: [DonationType.FUNDRAISER_FORM, DonationType.FUNDRAISER_PAGE],
      conditionSql: (fieldOps: string) =>
        `
          EXISTS (
            SELECT 1
            FROM "re2_fundraisers" f
            WHERE f."id" = "user_donation_payment"."reference_id"
              AND ${fieldOps.replace(/__FIELD__/g, fundraiserField)}
          )
        `,
    },
    {
      reasons: [DonationType.INTEGRATION_CART_BANNER],
      conditionSql: (fieldOps: string) =>
        `
          EXISTS (
            SELECT 1
            FROM "re2_shopify_cart_banner_settings" cb
            JOIN "re2_shopify_integrations" si ON cb."shopifyIntegrationId" = si."id"
            WHERE cb."id" = "user_donation_payment"."reference_id"
              AND ${fieldOps.replace(/__FIELD__/g, shopifyField)}
          )
        `,
    },
    {
      reasons: [DonationType.INTEGRATION_CART_DRAWER],
      conditionSql: (fieldOps: string) =>
        `
          EXISTS (
            SELECT 1
            FROM "re2_shopify_cart_drawer_settings" cd
            JOIN "re2_shopify_integrations" si ON cd."shopifyIntegrationId" = si."id"
            WHERE cd."id" = "user_donation_payment"."reference_id"
              AND ${fieldOps.replace(/__FIELD__/g, shopifyField)}
          )
        `,
    },
    {
      reasons: [DonationType.INTEGRATION_SALES_PORTION],
      conditionSql: (fieldOps: string) =>
        `
          EXISTS (
            SELECT 1
            FROM "re2_shopify_sale_portion_settings" sp
            JOIN "re2_shopify_integrations" si ON sp."shopifyIntegrationId" = si."id"
            WHERE sp."id" = "user_donation_payment"."reference_id"
              AND ${fieldOps.replace(/__FIELD__/g, shopifyField)}
          )
        `,
    },
  ]

  const orClauses = dateEntries.map((entry) => {
    const reasonsSql = entry.reasons.map((r) => `'${r}'`).join(', ')
    return `
      (
        "data"."reason" IN (${reasonsSql})
        AND ${entry.conditionSql(baseOps)}
      )
    `
  })

  const finalSql = `(${orClauses.join(' OR ')})`

  return {
    sql: finalSql,
    params: paramEntries,
  }
}

/**
 * Get the net or gross donation field
 * @param alias - The alias of the donation table
 * @param isGross - Whether to get the gross donation field
 * @param addSystemFees - Whether to add the system fees to the donation field
 * @returns The net or gross donation field
 * @example
 * GetNetOrGrossDonationField('donation', true, true) // "donation"."amount" + "donation"."system_fees"
 * GetNetOrGrossDonationField('donation', true, false) // "donation"."amount"
 * GetNetOrGrossDonationField('donation', false, true) // "donation"."amount" - "donation"."system_fees"
 * GetNetOrGrossDonationField('donation', false, false) // "donation"."amount"
 */
export function GetNetOrGrossDonationField(
  alias: string,
  isGross: boolean = false,
  addSystemFees: boolean = false,
): string {
  const operator = addSystemFees ? '+' : isGross ? '' : '-'

  return `"${alias}"."amount"${operator ? ` ${operator} "system_fees"` : ''}`
}

/**
 * Get the nonprofit donation query
 * @param alias - The alias of the donation table
 * @returns The nonprofit donation query
 */
export function GetNonprofitDonationQuery(nonprofitId: string, isGross: boolean = false): string {
  nonprofitId = isUUID(nonprofitId) ? `'${nonprofitId}'` : nonprofitId

  return `SELECT COALESCE(
    SUM(
      ${GetNetOrGrossDonationField('donation', isGross)}
    ), 0)
    FROM
      "user_donations" "donation"
    WHERE ${CheckNonprofitDonationQuery('donation', nonprofitId)} AND "donation"."status" IN ('${
      DONATION_STATUS.COMPLETED
    }', '${DONATION_STATUS.SETTLED}')`
}

/**
 * Get the wishlist has quantity query
 * @param wishlistId - The wishlist id
 * @param variantId - The variant id
 * @returns The wishlist has quantity query
 */
export function GetWishlistHasQuantityQuery(wishlistId: string, variantId: string): string {
  const wishlistIdCondition = isUUID(wishlistId) ? `'${wishlistId}'` : wishlistId
  const variantIdCondition = isUUID(variantId) ? `'${variantId}'` : variantId

  return `SELECT
      COALESCE(SUM("cart_item"."quantity"), 0)::int "has"
    FROM
      "user_deal_buynow_cart" "cart"
    INNER JOIN "user_deal_buynow_cart_items" "cart_item"
      ON "cart_item"."cartId"="cart"."id"
    INNER JOIN "deal_variants" "variant"
      ON "variant"."id"="cart_item"."variantId"
    WHERE cart."wishlistId" = ${wishlistIdCondition}
      AND "variant"."id" = ${variantIdCondition}
      AND "cart"."status" NOT IN ('${CartStatus.PENDING}', '${CartStatus.CANCELLED}')`
}

/**
 * Get the user wishlist donation query
 * @param userId - The user id
 * @returns The user wishlist donation query
 */
export function GetUserWishlistDonationQuery(userId: string, donorId: string): string {
  const userIdCondition = isUUID(userId) ? `'${userId}'` : userId
  const donorIdCondition = isUUID(donorId) ? `'${donorId}'` : donorId

  return `SELECT
    COALESCE(SUM("donation"."amount"), 0)
  FROM
    "user_donations" "donation"
  INNER JOIN "user_deal_item_payment" "payment" ON "payment"."id" = "donation"."userDealItemPaymentId"
  INNER JOIN "user_deal_payment" "deal_payment" ON "deal_payment"."id" = "payment"."paymentId"
  INNER JOIN "user_deal_buynow_cart" "cart" ON "cart"."id" = "deal_payment"."cartId"
  INNER JOIN "wishlists" "wishlist"
    ON "wishlist"."id" = "cart"."wishlistId"
  WHERE "wishlist"."userId" = ${userIdCondition}
    AND "donation"."userId" = ${donorIdCondition}
    AND "wishlist"."status" = '${WishlistStatus.PUBLIC}'
    AND "donation"."status" IN ('${DONATION_STATUS.COMPLETED}', '${DONATION_STATUS.SETTLED}')`
}
