export function GetFundraiserKeywordSql(condition: string, keyword: string): string {
  return ` ${condition ? 'AND' : 'WHERE'} (
    "fundraiser"."title" ILIKE '%${keyword}%'
    OR EXISTS (
      SELECT 1
      FROM "re2_fundraisers_nonprofit_users" "fundraiser_nonprofit"
      JOIN "nonprofit_profiles" "nonprofit_profile"
        ON "fundraiser_nonprofit"."nonprofitUsersId" = "nonprofit_profile"."userId"
      WHERE "fundraiser_nonprofit"."re2FundraisersId" = "fundraiser"."id"
        AND (
          "nonprofit_profile"."first_name" ILIKE '%${keyword}%'
          OR "nonprofit_profile"."last_name" ILIKE '%${keyword}%'
          OR "nonprofit_profile"."foundation_name" ILIKE '%${keyword}%'
        )
    )
    OR EXISTS (
      SELECT 1
      FROM "re2_fundraisers_donation_projects" "fundraiser_project"
      JOIN "donation_projects" "project"
        ON "fundraiser_project"."donationProjectsId" = "project"."id"
      WHERE "fundraiser_project"."re2FundraisersId" = "fundraiser"."id"
        AND "project"."name" ILIKE '%${keyword}%'
    )
  )`
}

export function GetNonprofitDataSql(mainTable: string, condition: string): string {
  return ` SELECT 
    JSONB_AGG(
      JSONB_BUILD_OBJECT(
        'id', "nonprofit_profile"."id", 'first_name', 
        "nonprofit_profile"."first_name", 
        'last_name', "nonprofit_profile"."last_name", 
        'foundation_name', "nonprofit_profile"."foundation_name", 
        'status', "nonprofit_profile"."status"
      )
    ) 
  FROM 
    "${mainTable}" "nonprofit" 
    JOIN "nonprofit_profiles" "nonprofit_profile" ON "nonprofit"."nonprofitUsersId" = "nonprofit_profile"."userId" 
  WHERE 
    ${condition}`
}

export function GetDonationProjectDataSql(mainTable: string, condition: string): string {
  return `SELECT 
    JSONB_AGG(
      JSONB_BUILD_OBJECT(
        'id', "project"."id", 'name', "project"."name", 
        'status', "project"."status"
      )
    ) 
  FROM 
    "${mainTable}" "donation_project" 
    JOIN "donation_projects" "project" ON "donation_project"."donationProjectsId" = "project"."id" 
  WHERE 
    ${condition}`
}

export function BuildKeywordExistsCondition(
  tableAlias: string,
  relationshipTable: string,
  relationshipColumn: string,
  targetTable: string,
  keywordColumns: string[],
  keyword: string,
): string {
  const keywordCondition = keywordColumns
    .map((column) => `"${tableAlias}"."${column}" ILIKE '%${keyword}%'`)
    .join(' OR ')

  return `
    AND EXISTS (
      SELECT 1
      FROM "${relationshipTable}" "${tableAlias}_relationship"
      JOIN "${targetTable}" "${tableAlias}"
        ON "${tableAlias}_relationship"."${relationshipColumn}" = "${tableAlias}"."id"
      WHERE "${tableAlias}_relationship"."${relationshipColumn}" = "${tableAlias}"."id"
        AND (${keywordCondition})
    )
  `
}

export function GetTotalRecordsCountSql(
  fundraiserCondition: string,
  integrationCondition: string,
  cartBannerKeywordCondition: string,
  cartDrawerKeywordCondition: string,
  salesPortionKeywordCondition: string,
  includeFundraiser = true,
): string {
  const countSql = `SELECT COUNT(*) AS total_count 
    FROM (
      ${
        includeFundraiser
          ? `SELECT 1 FROM "re2_fundraisers" "fundraiser" ${fundraiserCondition} UNION ALL `
          : ''
      }
      SELECT 1 FROM "re2_integrations" "integration" 
        LEFT JOIN "re2_shopify_integrations" "shopify_integration" ON "integration"."id" = "shopify_integration"."integrationId" 
        LEFT JOIN "re2_shopify_sale_portion_settings" "portion_settings" ON "shopify_integration"."id" = "portion_settings"."shopifyIntegrationId" 
        ${integrationCondition} ${salesPortionKeywordCondition}
      UNION ALL
      SELECT 1 FROM "re2_integrations" "integration"
        LEFT JOIN "re2_shopify_integrations" "shopify_integration" ON "integration"."id" = "shopify_integration"."integrationId" 
        LEFT JOIN "re2_shopify_cart_banner_settings" "cart_banner_settings" ON "shopify_integration"."id" = "cart_banner_settings"."shopifyIntegrationId" 
        ${integrationCondition} ${cartBannerKeywordCondition}
      UNION ALL
      SELECT 1 FROM "re2_integrations" "integration"
        LEFT JOIN "re2_shopify_integrations" "shopify_integration" ON "integration"."id" = "shopify_integration"."integrationId" 
        LEFT JOIN "re2_shopify_cart_drawer_settings" "cart_drawer_settings" ON "shopify_integration"."id" = "cart_drawer_settings"."shopifyIntegrationId" 
        ${integrationCondition} ${cartDrawerKeywordCondition}
    ) AS total_records`

  return countSql
}
