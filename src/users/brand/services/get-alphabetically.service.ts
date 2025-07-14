import { QueryDto } from '@app/src/users/brand/dto'
import { DealStatus } from '@app/src/users/deal/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'

export default async function (query: QueryDto, language: string): Promise<any> {
  try {
    let otherLabel = 'Others'
    let where = ` WHERE "id" IN (SELECT "brandId" FROM "deals" WHERE "status" IN ('${DealStatus.ON_DEAL}', '${DealStatus.ENDED}'))`

    if (language !== 'ja-JP' && language !== 'ja-Kana') {
      language = 'en-US'
    }

    if (language === 'ja-JP' || language === 'ja-Kana') {
      otherLabel = 'その他'
    }

    if (query?.keyword) {
      where += ` AND "id" IN (
        SELECT
          "id"
        FROM 
          "brands"
        WHERE 
          "id" IN (
            SELECT
              "brandId"
            FROM
              public."brand_translations"
            WHERE
              "name" ILIKE '%${query.keyword}%'
          )
      )`
    }

    const data = await this.entityManager.query(
      `WITH all_alphabets AS (
        SELECT
          DISTINCT "alphabet"
        FROM
          "brand_translations_${language}"
      ),
      alphabets_with_brands AS (
        SELECT 
          COALESCE("alphabet", '${otherLabel}') AS "alphabet", 
          json_agg(json_build_object('id', "id", 'name', "name") ORDER BY "name" ASC) AS "brands" 
        FROM
          "brand_translations_${language}"
        ${where}
        GROUP BY 
          COALESCE("alphabet", '${otherLabel}')
      )
      SELECT
        json_object_agg(
          awb."alphabet", 
          COALESCE(awb."brands", '[]') 
          ORDER BY 
            CASE WHEN awb."alphabet" = '${otherLabel}' THEN 1 ELSE 0 END, 
            awb."alphabet" ASC
        ) AS result 
      FROM 
        alphabets_with_brands awb
      WHERE 
        awb."brands" IS NOT NULL AND json_array_length(awb."brands") > 0;`,
    )

    return {
      data: data[0]?.result,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
