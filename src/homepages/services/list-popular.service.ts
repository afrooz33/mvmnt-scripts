import { Status } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryDto } from '@app/src/homepages/dto'
import { DealType } from '@app/src/users/deal/enums'
import { PopularEntity } from '@app/src/homepages/enums'
import { HomepagesEntity } from '@app/src/admin/homepages/entities/homepages.entity'

export default async function (
  query: QueryDto,
  entity: PopularEntity,
  homepage: HomepagesEntity | null = null,
): Promise<any> {
  try {
    const response = {
      data: [],
      meta: {},
    }

    const page = parseInt(query.page || '1', 10)
    const limit = parseInt(query.limit || '10', 10)
    const offset = (page - 1) * limit

    // Dynamically switch between brand/category
    // (PopularEntity.BRANDS or PopularEntity.DEAL_CATEGORIES)
    // Adjust to your actual enum names as needed
    let entity_table = ''
    let field = ''
    let translation_entity = ''

    if (entity === PopularEntity.BRANDS) {
      entity_table = 'brands'
      field = 'brandId'
      translation_entity = 'brand_translations'
    } else {
      entity_table = 'deal_categories'
      field = 'categoryId'
      translation_entity = 'deal_category_translations'
    }

    // If the homepage argument is present, we modify the WHERE to filter only those
    // items that appear on the homepage.
    let homepageCondition = ''
    if (homepage) {
      homepageCondition = `AND e."id" IN (
        SELECT DISTINCT ON ("${field}") "${field}"
        FROM "homepage_contents"
        WHERE "homepageId" = '${homepage.id}'
      )`
    }

    /**
     * Using the structure of your FIRST SQL snippet:
     *
     * 1) FilteredDeals (just deals with ON_DEAL or ENDED)
     * 2) DealCounts (grouped by brand/category)
     * 3) MaxPriceDeal (attach the first image & find the max price for BUYNOW deals)
     * 4) EntityTranslations (the brand/category translations CTE)
     * 5) TopLikedDeals (find top 3 deals by like count, partitioned by brand/category)
     * 6) Final SELECT returning the aggregated data
     */
    const queryString = `
      WITH
      FilteredDeals AS (
        SELECT
          "id",
          "name",
          "deal_type",
          "${field}",
          "starting_price",
          "status"
        FROM "deals"
        WHERE "status" IN ('${Status.ON_DEAL}', '${Status.ENDED}')
      ),

      DealCounts AS (
        SELECT
          e."id" AS "id",
          e."name" AS "name",
          COUNT(d."id") AS "deal_count"
        FROM "${entity_table}" e
        JOIN FilteredDeals d ON e."id" = d."${field}"
        WHERE e."status" = '${Status.ENABLED}'
        ${homepageCondition}
        GROUP BY e."id", e."name"
        HAVING COUNT(d."id") > 2
      ),

      MaxPriceDeal AS (
        SELECT
          d."id" AS "deal_id",
          d."name" AS "deal_name",
          d."${field}",
          CASE
            WHEN d."deal_type" = '${DealType.RAFFLE}' THEN (
              SELECT i."url"
              FROM "deal_raffle_prizes_images_images" drpi
              JOIN "images" i ON i."id" = drpi."imagesId"
              JOIN "deal_raffles" dr ON dr."dealId" = d."id"
              JOIN "deal_raffle_prizes" drp ON drp."rafflesId" = dr."id"
                AND drpi."dealRafflePrizesId" = drp."id"
              LIMIT 1
            )
            WHEN d."deal_type" = '${DealType.BUYNOW}' THEN (
              SELECT i."url"
              FROM "deal_variants_images_images" dvii
              JOIN "images" i ON i."id" = dvii."imagesId"
              JOIN "deal_variants" dv ON dv."dealId" = d."id"
                AND dvii."dealVariantsId" = dv."id"
              LIMIT 1
            )
            ELSE (
              SELECT i."url"
              FROM "deals_images_images" dii
              JOIN "images" i ON i."id" = dii."imagesId"
              WHERE d."id" = dii."dealsId"
              LIMIT 1
            )
          END AS "deal_image",
          CASE 
            WHEN d."deal_type" = '${DealType.BUYNOW}' THEN (
              SELECT MAX(dv."price")
              FROM "deal_variants" dv
              WHERE dv."dealId" = d."id"
            )
            ELSE d."starting_price"
          END AS "starting_price"
        FROM FilteredDeals d
      ),

      EntityTranslations AS (
        SELECT DISTINCT ON ("${field}", "languageId")
          "${field}", "languageId", "name"
        FROM "${translation_entity}"
        WHERE "${field}" IN (SELECT "id" FROM DealCounts)
        ORDER BY "${field}", "languageId", "id"
      ),

      TopLikedDeals AS (
        SELECT
          x.*,
          CASE
            WHEN x."deal_type" = '${DealType.RAFFLE}' THEN (
              SELECT i."url"
              FROM "deal_raffle_prizes_images_images" drpi
              JOIN "images" i ON i."id" = drpi."imagesId"
              JOIN "deal_raffles" dr ON dr."dealId" = x."id"
              JOIN "deal_raffle_prizes" drp ON drp."rafflesId" = dr."id"
                AND drpi."dealRafflePrizesId" = drp."id"
              LIMIT 1
            )
            WHEN x."deal_type" = '${DealType.BUYNOW}' THEN (
              SELECT i."url"
              FROM "deal_variants_images_images" dvii
              JOIN "images" i ON i."id" = dvii."imagesId"
              JOIN "deal_variants" dv ON dv."dealId" = x."id"
                AND dvii."dealVariantsId" = dv."id"
              LIMIT 1
            )
            ELSE (
              SELECT i."url"
              FROM "deals_images_images" dii
              JOIN "images" i ON i."id" = dii."imagesId"
              WHERE x."id" = dii."dealsId"
              LIMIT 1
            )
          END AS "image"
        FROM (
          SELECT
            d."id",
            d."name",
            d."deal_type",
            d."${field}",
            -- Rank by # of likes descending, partitioned by brand/category
            ROW_NUMBER() OVER (
              PARTITION BY d."${field}" 
              ORDER BY COUNT(udl."id") DESC
            ) AS "ranking"
          FROM
            FilteredDeals d
          LEFT JOIN "user_deals_likes" udl ON d."id" = udl."dealId"
          WHERE d."${field}" IN (SELECT "id" FROM DealCounts)
          GROUP BY d."id", d."name", d."deal_type", d."${field}"
        ) x
        WHERE x."ranking" <= 3
      )

      SELECT
        dc."id",
        dc."name",
        dc."deal_count",
        MAX(mpd."deal_image") AS "image_url",
        jsonb_object_agg(l."name", et."name") FILTER (WHERE et."name" IS NOT NULL) AS "translations",
        (
          SELECT json_agg(
            json_build_object(
              'id', tld."id",
              'name', tld."name",
              'deal_type', tld."deal_type",
              'image', tld."image"
            )
          )
          FROM TopLikedDeals tld
          WHERE tld."${field}" = dc."id"
        ) AS "related_deals"
      FROM DealCounts dc
      JOIN MaxPriceDeal mpd ON dc."id" = mpd."${field}"
      LEFT JOIN EntityTranslations et ON dc."id" = et."${field}"
      LEFT JOIN "languages" l ON et."languageId" = l."id"
      GROUP BY
        dc."id", dc."name", dc."deal_count"
      ORDER BY dc."deal_count" DESC
      LIMIT ${limit} OFFSET ${offset};
    `

    const result = await this.entityManager.query(queryString)
    response.data = result

    return response
  } catch (error) {
    return HandleErrors(error)
  }
}
