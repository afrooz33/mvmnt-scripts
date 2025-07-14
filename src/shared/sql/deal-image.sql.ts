import { DealType } from '@app/src/users/deal/enums'

/**
 * @SQL - Get deal image query
 * @param {string} condition - condition
 * @returns {string} - query
 */
export function GetDealImageQuery(condition: string): string {
  return `(SELECT
    "images"."url"
  FROM
    "images"
  LEFT JOIN
    "deals_images_images" "deal_images" ON "deal_images"."imagesId" = "images"."id"
  WHERE ${condition} = "deal_images"."dealsId" LIMIT 1)`
}

export function GetDealFirstImageQuery(condition: string, join: string): string {
  return `CASE
  WHEN ${condition} = '${DealType.RAFFLE}' THEN (
    SELECT
      "images"."url"
    FROM
      "deal_raffle_prizes_images_images" "drpi"
    LEFT JOIN "images" ON "images"."id" = "drpi"."imagesId"
    LEFT JOIN "deal_raffles" ON "deal_raffles"."dealId" = ${join}
    LEFT JOIN "deal_raffle_prizes" ON "deal_raffle_prizes"."rafflesId" = "deal_raffles"."id"
    WHERE "drpi"."dealRafflePrizesId" = "deal_raffle_prizes"."id" and "images"."is_featured" = TRUE
	  order by "deal_raffle_prizes"."rank"
    LIMIT 1
  )
  WHEN ${condition} = '${DealType.BUYNOW}' THEN (
    SELECT
      "images"."url"
    FROM
      "deal_variants_images_images" "dvii"
    LEFT JOIN "images" ON "images"."id" = "dvii"."imagesId"
    LEFT JOIN "deal_variants" ON "deal_variants"."dealId" = ${join}
    WHERE "dvii"."dealVariantsId" = "deal_variants"."id" LIMIT 1
  )
  ELSE (
    SELECT
      "images"."url"
    FROM
      "deals_images_images" "deal_images"
    LEFT JOIN "images" ON "images"."id" = "deal_images"."imagesId"
    WHERE ${join} = "deal_images"."dealsId" LIMIT 1
  ) END AS "deal_image"`
}
