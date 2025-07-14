import { PaginateRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryDto } from '@app/src/homepages/dto'
import { DealStatus, DealType } from '@app/src/users/deal/enums'

function GetTrendingDealsSql(isCount) {
  const selectClause = isCount
    ? 'COUNT(*) AS "total_count"'
    : `
      "data"."id" AS "data_id", 
      "data"."deal_type" AS "data_deal_type", 
      "data"."name" AS "data_name", 
      "data"."item_condition" AS "data_item_condition", 
      "data"."starting_price" AS "data_starting_price", 
      "data"."start_date" AS "data_start_date", 
      "data"."end_date" AS "data_end_date", 
      "data"."donation_type" AS "data_donation_type", 
      "data"."donation_amount" AS "data_donation_amount", 
      "data"."status" AS "data_status", 
      "user"."username" AS "user_username", 
      "user"."display_name" AS "user_display_name", 
      "user"."account_type" AS "user_account_type", 
      "user"."id" AS "user_id",
      'Trending' AS "type",
      -- Deal image based on type
      CASE 
        WHEN "data"."deal_type" = 'RAFFLE' THEN (SELECT "image_url" FROM raffle_images WHERE "dealId" = "data"."id" LIMIT 1)
        WHEN "data"."deal_type" = 'BUYNOW' THEN (SELECT "image_url" FROM buynow_images WHERE "dealId" = "data"."id" LIMIT 1)
        ELSE (SELECT "image_url" FROM regular_images WHERE "dealId" = "data"."id" LIMIT 1)
      END AS "deal_image",
      -- Profile image
      "pi"."profile_image_url" AS "user_profile_image",
      -- Pre-calculated metrics
      COALESCE("db"."current_bid", 0) AS "current_bid",
      "dv"."lowest_price",
      COALESCE("db"."total_bids", 0) AS "total_bids",
      COALESCE("dp"."total_prizes", 0) AS "total_prizes",
      COALESCE("di"."total_remaining_quantity", 0) AS "total_remaining_quantity",
      COALESCE("dl"."total_likes", 0) AS "total_likes",
      COALESCE("dv"."variants_count", 0) AS "variants_count"
    `

  return `WITH 
    deal_likes AS (
      SELECT 
        "dealId", 
        COUNT("id")::int AS "total_likes"
      FROM 
        "user_deals_likes"
      GROUP BY 
        "dealId"
    ),
    deal_bids AS (
      SELECT 
        "dealId",
        MAX("bid_amount")::float AS "current_bid",
        COUNT("id")::int AS "total_bids"
      FROM 
        "user_deal_bids"
      GROUP BY 
        "dealId"
    ),
    deal_variants_info AS (
      SELECT 
        "dealId",
        MIN("price") AS "lowest_price",
        COUNT("id")::int AS "variants_count"
      FROM 
        "deal_variants"
      GROUP BY 
        "dealId"
    ),
    deal_inventory AS (
      SELECT 
        "deals"."id" AS "dealId",
        COALESCE(SUM("inventory"."quantity"), 0)::int AS "total_remaining_quantity"
      FROM 
        "deals"
        LEFT JOIN "deal_variants" "dv" ON "deals"."id" = "dv"."dealId"
        LEFT JOIN "deal_variant_inventory" "inventory" ON "dv"."id" = "inventory"."variantId"
      GROUP BY 
        "deals"."id"
    ),
    deal_prizes AS (
      SELECT
        "deal_raffles"."dealId",
        COUNT("deal_raffle_prizes"."id") AS "total_prizes"
      FROM
        "deal_raffle_prizes"
        LEFT JOIN "deal_raffles" ON "deal_raffles"."id" = "deal_raffle_prizes"."rafflesId"
      GROUP BY
        "deal_raffles"."dealId"
    ),
    raffle_images AS (
      SELECT
        "data"."id" AS "dealId",
        "images"."url" AS "image_url"
      FROM
        "deals" "data"
        LEFT JOIN "deal_raffles" ON "deal_raffles"."dealId" = "data"."id"
        LEFT JOIN "deal_raffle_prizes" ON "deal_raffle_prizes"."rafflesId" = "deal_raffles"."id"
        LEFT JOIN "deal_raffle_prizes_images_images" "drpi" ON "drpi"."dealRafflePrizesId" = "deal_raffle_prizes"."id"
        LEFT JOIN "images" ON "images"."id" = "drpi"."imagesId"
      WHERE
        "data"."deal_type" = 'RAFFLE' AND "images"."is_featured" = TRUE
      ORDER BY "deal_raffle_prizes"."rank"
    ),
    buynow_images AS (
      SELECT
        "data"."id" AS "dealId",
        "images"."url" AS "image_url"
      FROM
        "deals" "data"
        LEFT JOIN "deal_variants" ON "deal_variants"."dealId" = "data"."id"
        LEFT JOIN "deal_variants_images_images" "dvii" ON "dvii"."dealVariantsId" = "deal_variants"."id"
        LEFT JOIN "images" ON "images"."id" = "dvii"."imagesId"
      WHERE
        "data"."deal_type" = '${DealType.BUYNOW}'
    ),
    regular_images AS (
      SELECT
        "data"."id" AS "dealId",
        "images"."url" AS "image_url"
      FROM
        "deals" "data"
        LEFT JOIN "deals_images_images" "deal_images" ON "data"."id" = "deal_images"."dealsId"
        LEFT JOIN "images" ON "images"."id" = "deal_images"."imagesId"
    ),
    user_profile_image AS (
      SELECT
        "user_profiles"."userId",
        "images"."url" AS "profile_image_url"
      FROM
        "user_profiles"
        LEFT JOIN "images" ON "images"."id" = "user_profiles"."profileImagesId"
    )
    SELECT ${selectClause}
    FROM "deals" "data"
    LEFT JOIN "users" "user" ON "user"."id" = "data"."userId"
    LEFT JOIN user_profile_image "pi" ON "pi"."userId" = "user"."id"
    LEFT JOIN deal_likes "dl" ON "dl"."dealId" = "data"."id"
    LEFT JOIN deal_bids "db" ON "db"."dealId" = "data"."id"
    LEFT JOIN deal_variants_info "dv" ON "dv"."dealId" = "data"."id"
    LEFT JOIN deal_inventory "di" ON "di"."dealId" = "data"."id"
    LEFT JOIN deal_prizes "dp" ON "dp"."dealId" = "data"."id"
    WHERE COALESCE("dl"."total_likes", 0) > 0 
    AND "data"."status" IN ('${DealStatus.ON_DEAL}', '${DealStatus.ENDED}')
    ${isCount ? '' : 'ORDER BY "dl"."total_likes" DESC'}`
}

export default async function (query: QueryDto): Promise<PaginateRO> {
  try {
    const countSql = `SELECT COUNT(*) FROM (
      ${GetTrendingDealsSql(true)}
    ) AS total_count`

    const page = Number.parseInt(query.page) || 1
    const limit = Number.parseInt(query.limit) || 10

    const offset = (page - 1) * limit

    const data = await this.homepageContentRepository.query(
      `${GetTrendingDealsSql(false)} LIMIT $1 OFFSET $2`,
      [limit, offset],
    )

    const totalCountResult = await this.homepageContentRepository.query(countSql)

    const totalRecords = totalCountResult[0]?.total_count || 0

    return {
      data,
      meta: {
        limit,
        next_page: '',
        prev_page: '',
        current_page: page,
        total_record: Number.parseInt(totalRecords),
        total_page: Math.ceil(totalRecords / limit),
      },
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
