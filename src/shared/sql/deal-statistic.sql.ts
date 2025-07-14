import { DONATION_STATUS } from '@app/src/donations/enums'
import { DealStatus, DealType, DonationType } from '@app/src/users/deal/enums'
import { GetNetOrGrossDonationField } from './common.sql'

export function GetTotalBidsQuery(alias: string): string {
  return `SELECT
      COALESCE(COUNT("bids"."id")::int, 0)
    FROM
      "user_deal_bids" "bids"
    WHERE "bids"."dealId" = ${alias}."id"`
}

export function GetCurrentBidQuery(alias: string): string {
  return `SELECT
      COALESCE(MAX("bids"."bid_amount")::float, 0)
    FROM
      "user_deal_bids" "bids"
    WHERE "bids"."dealId" = ${alias}."id"`
}

export function GetAuctionParticipantQuery(alias: string): string {
  return `SELECT
      COALESCE(COUNT(DISTINCT "bids"."userId")::int, 0)
    FROM
      "user_deal_bids" "bids"
    WHERE "bids"."dealId" = ${alias}."id"`
}

export function GetGrossDonationsQuery(alias: string): string {
  return `SELECT
      COALESCE(SUM(${GetNetOrGrossDonationField('donation', true)}), 0)::float
    FROM
      "user_donations" AS "donation"
    LEFT JOIN "user_deal_item_payment" AS "payment" ON "payment"."id" = "donation"."userDealItemPaymentId"
    WHERE
      "payment"."dealId" = ${alias}."id"
      AND "donation"."status" IN ('${DONATION_STATUS.COMPLETED}', '${DONATION_STATUS.SETTLED}')`
}

export function GetNetDonationQuery(alias: string): string {
  return `SELECT
      COALESCE(SUM(${GetNetOrGrossDonationField('donation', false)}), 0)::float
    FROM
      "user_donations" AS "donation"
    INNER JOIN "user_deal_item_payment" AS "payment" ON "payment"."id" = "donation"."userDealItemPaymentId"
    WHERE
      "payment"."dealId" = ${alias}."id"
      AND "donation"."status" IN ('${DONATION_STATUS.COMPLETED}', '${DONATION_STATUS.SETTLED}')`
}

export function GetTotalDealLikesQuery(alias: string): string {
  return `(SELECT
      COALESCE(COUNT("user_deals_likes"."id")::int, 0)
    FROM
      "user_deals_likes"
    WHERE "user_deals_likes"."dealId" = ${alias}."id")`
}

export function GetRaffleTotalPrizesQuery(alias: string): string {
  return `SELECT
      COALESCE(COUNT("deal_raffle_prizes"."id")::int, 0)
    FROM
      "deal_raffle_prizes"
    LEFT JOIN "deal_raffles"
      ON "deal_raffles"."id" = "deal_raffle_prizes"."rafflesId"
    WHERE "deal_raffles"."dealId" = ${alias}."id"`
}

export function GetDealPriceQuery(alias: string): string {
  return `(CASE
      WHEN data.deal_type = '${DealType.AUCTION}' THEN (${GetCurrentBidQuery(alias)})
    WHEN data.deal_type = '${DealType.BUYNOW}' THEN (
      SELECT
        MIN("deal_variants"."price")
      FROM
        "deal_variants"
      WHERE
        "deal_variants"."dealId" = ${alias}."id"
    )
    ELSE data.starting_price END)`
}

export function GetTotalSharesQuery(alias: string): string {
  return `(SELECT
      COUNT("user_deals_shares"."id")
    FROM
      "user_deals_shares"
    WHERE "user_deals_shares"."dealId" = ${alias}."id")`
}

export function GetTotalLikesQuery(alias: string): string {
  return `(SELECT
      COUNT("user_deals_likes"."id")
    FROM
      "user_deals_likes"
    WHERE "user_deals_likes"."dealId" = ${alias}."id")`
}

export function GetDonationAmountQuery(alias: string): string {
  return `CASE 
    WHEN ${alias}."deal_type" = '${DealType.AUCTION}' THEN (
      CASE 
        WHEN ${alias}."donation_type" = '${DonationType.FIXED_PER_ORDER}' THEN ${alias}."donation_amount" 
        WHEN ${alias}."donation_type" = '${DonationType.PERCENTAGE_PER_ORDER}' THEN (
          SELECT 
            COALESCE(
              MAX("bids"."bid_amount"):: float, 
              0
            ) 
          FROM 
            "user_deal_bids" "bids" 
          WHERE 
            "bids"."dealId" = ${alias}."id"
        ) * ${alias}."donation_amount" / 100 
        WHEN ${alias}."donation_type" = '${DonationType.WINNING_BID_ROUND_UP}' THEN (
          SELECT 
            CEIL(
              COALESCE(
                MAX("bids"."bid_amount"):: float, 
                0
              ) / 10
            ) * 10 
          FROM 
            "user_deal_bids" "bids" 
          WHERE 
            "bids"."dealId" = ${alias}."id"
        ) 
        ELSE '0' 
      END
    )
    WHEN ${alias}."deal_type" = '${DealType.RAFFLE}' THEN (
      CASE
        WHEN ${alias}."donation_type" = '${DonationType.FIXED_PER_ENTRY}' THEN ${alias}."donation_amount"
        WHEN ${alias}."donation_type" = '${DonationType.PERCENTAGE_PER_ORDER}' THEN (${alias}."starting_price" * ${alias}."donation_amount" / 100)
        ELSE '0'
      END
    )
    WHEN ${alias}."deal_type" = '${DealType.BUYNOW}' THEN (
      CASE
        WHEN ${alias}."donation_type" = '${DonationType.FIXED_PER_ITEM}' THEN ${alias}."donation_amount"
        WHEN ${alias}."donation_type" = '${DonationType.FIXED_PER_ORDER}' THEN ${alias}."donation_amount"
        WHEN ${alias}."donation_type" = '${DonationType.FIXED_PERCENTAGE_PER_ITEM}' THEN (
          SELECT
            MIN("deal_variants"."price")
          FROM
            "deal_variants"
          WHERE
            "deal_variants"."dealId" = ${alias}."id"
        ) * ${alias}."donation_amount" / 100
        WHEN ${alias}."donation_type" = '${DonationType.PERCENTAGE_PER_ORDER}' THEN (
          SELECT
            MIN("deal_variants"."price")
          FROM
            "deal_variants"
          WHERE
            "deal_variants"."dealId" = ${alias}."id"
        ) * ${alias}."donation_amount" / 100
        WHEN ${alias}."donation_type" = '${DonationType.ROUND_UP_SUB_TOTAL}' THEN (
          SELECT
            CEIL(
              MIN("deal_variants"."price") / 10
            ) * 10
          FROM
            "deal_variants"
          WHERE
            "deal_variants"."dealId" = ${alias}."id"
        )
        WHEN ${alias}."donation_type" = '${DonationType.MONHTLY_RECURRING}' THEN ${alias}."donation_amount"
        ELSE '0'
      END
    )
    ELSE '0'
  END`
}

export function GetRelatedDealsQuery(condition: string): string {
  return `(
    SELECT 
      json_agg(
        json_build_object(
          'id', "deals"."id",
          'name', "deals"."name",
          'deal_type', "deals"."deal_type",
          'image',
          CASE
            WHEN "deals"."deal_type" = '${DealType.RAFFLE}' THEN (
              SELECT
                "images"."url"
              FROM
                "deal_raffle_prizes_images_images" "drpi"
              LEFT JOIN "images" ON "images"."id" = "drpi"."imagesId"
              LEFT JOIN "deal_raffles" ON "deal_raffles"."dealId" = "deals"."id"
              LEFT JOIN "deal_raffle_prizes" ON "deal_raffle_prizes"."rafflesId" = "deal_raffles"."id"
              WHERE "drpi"."dealRafflePrizesId" = "deal_raffle_prizes"."id" LIMIT 1
            ) 
            WHEN "deals"."deal_type" = '${DealType.BUYNOW}' THEN (
              SELECT
                "images"."url"
              FROM
                "deal_variants_images_images" "dvii"
              LEFT JOIN "images" ON "images"."id" = "dvii"."imagesId"
              LEFT JOIN "deal_variants" ON "deal_variants"."dealId" = "deals"."id"
              WHERE "dvii"."dealVariantsId" = "deal_variants"."id" LIMIT 1
            ) 
            ELSE (
              SELECT
                "images"."url"
              FROM
                "deals_images_images" "deal_images"
              LEFT JOIN "images" ON "images"."id" = "deal_images"."imagesId"
              WHERE "deals"."id" = "deal_images"."dealsId" LIMIT 1
            )
          END
        )
      )
    FROM 
    (
      SELECT 
        "deals"."id",
        "deals"."name",
        "deals"."deal_type",
        ROW_NUMBER() OVER (ORDER BY COUNT("user_deals_likes"."id") DESC) AS "like_rank"
      FROM
        "deals"
      LEFT JOIN
        "user_deals_likes" ON "deals"."id" = "user_deals_likes"."dealId"
      WHERE 
        "deals"."status" IN ('${DealStatus.ENDED}', '${DealStatus.ON_DEAL}') ${condition}
      GROUP BY 
        "deals"."id", 
        "deals"."name", 
        "deals"."deal_type"
      ORDER BY 
        COUNT("user_deals_likes"."id") DESC
      LIMIT
        3
    ) AS "deals"
    WHERE "like_rank" <= 3
  )`
}

export function GetDealQuantityQuery(condition: string): string {
  return `(SELECT
      COALESCE(SUM("inventory"."quantity"), 0)::int
    FROM
      "deal_variant_inventory" "inventory"
    LEFT JOIN "deal_variants" "dv" ON "dv"."id" = "inventory"."variantId"
    LEFT JOIN "deals" ON "deals"."id" = "dv"."dealId"
    WHERE ${condition})`
}
