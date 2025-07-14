import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { DealStatus } from '@app/src/users/deal/enums'
import { QueryDto } from '@app/src/users/deal/category/dto'
import { DealCategoryStatus, DealCategoryType } from '@app/src/admin/deals/category/enums'

export default async function (query: QueryDto, language: string): Promise<any> {
  try {
    if (!language) {
      language = 'en-US'
    }

    let categoryType = 'dc_big'
    let where = `WHERE "status" = '${DealCategoryStatus.ENABLED}'`

    if (query?.filter?.type === DealCategoryType.SMALL) {
      categoryType = 'dc_small'
    } else if (query?.filter?.type === DealCategoryType.MIDDLE) {
      categoryType = 'dc_middle'
    }

    if (query?.filter?.parent) {
      where += ` AND "parentId" = '${query.filter.parent}'`
    }

    if (query?.filter?.type) {
      where += ` AND "type" = '${query.filter.type}'`
    } else if (!query?.filter?.parent) {
      where += ` AND "type" = '${DealCategoryType.BIG}'`
    }

    where += ` AND "c"."id" IN (SELECT
        DISTINCT "${categoryType}"."id"
      FROM
        "deal_categories" "dc_small"
        JOIN "deal_categories" "dc_middle" ON "dc_small"."parentId" = "dc_middle"."id"
        JOIN "deal_categories" "dc_big" ON "dc_middle"."parentId" = "dc_big"."id"
        JOIN "deals" "d" ON "dc_small"."id" = "d"."categoryId"
          AND "d"."status" IN ('${DealStatus.ON_DEAL}', '${DealStatus.ENDED}')
      WHERE
        "dc_small".type = '${DealCategoryType.SMALL}')`

    if (query?.keyword) {
      where += ` AND "c"."id" IN (
        SELECT 
          unnest(category_ids) AS category_id 
        FROM 
          (
            SELECT 
              ARRAY_REMOVE(
                ARRAY[ (
                  SELECT 
                    dc_small.id 
                  FROM 
                    "deal_categories" dc_small 
                  WHERE 
                    dc_small.id = (
                      SELECT 
                        "categoryId" 
                      FROM 
                        public."deal_category_translations" 
                      WHERE 
                        "name" ILIKE '%${query.keyword}%'
                    )
                ), 
                (
                  SELECT 
                    dc_middle.id 
                  FROM 
                    "deal_categories" dc_small 
                    LEFT JOIN "deal_categories" dc_middle ON dc_small."parentId" = dc_middle.id 
                  WHERE 
                    dc_small.id = (
                      SELECT 
                        "categoryId" 
                      FROM 
                        public."deal_category_translations" 
                      WHERE 
                        "name" ILIKE '%${query.keyword}%'
                    )
                ), 
                (
                  SELECT 
                    dc_big.id 
                  FROM 
                    "deal_categories" dc_small 
                    LEFT JOIN "deal_categories" dc_middle ON dc_small."parentId" = dc_middle.id 
                    LEFT JOIN "deal_categories" dc_big ON dc_middle."parentId" = dc_big.id 
                  WHERE 
                    dc_small.id = (
                      SELECT 
                        "categoryId" 
                      FROM 
                        public."deal_category_translations" 
                      WHERE 
                        "name" ILIKE '%${query.keyword}%'
                    )
                ) ], 
                NULL
              ) AS category_ids
          ) 
        WHERE 
          category_ids IS NOT NULL
      )`
    }

    const sql = `WITH RECURSIVE CategoryHierarchy AS (
      SELECT 
        id, 
        name, 
        name AS breadcrumbs 
      FROM 
        "deal_category_view_${language}" 
      WHERE 
        "parentId" IS NULL 
      UNION ALL 
      SELECT 
        c.id, 
        c.name, 
        CONCAT(ch.breadcrumbs, ' > ', c.name) 
      FROM 
        "deal_category_view_${language}" c 
        JOIN CategoryHierarchy ch ON c."parentId" = ch.id
    ) 
    SELECT 
      c.*, 
      (
        SELECT 
          jsonb_agg(
            child_data 
            ORDER BY 
              child_data ->> 'display_order' ASC
          )
        FROM 
          (
            SELECT 
              jsonb_build_object(
                'id', 
                c_child.id, 
                'name', 
                c_child.name, 
                'type', 
                c_child.type, 
                'status', 
                c_child.status, 
                'breadcrumbs', 
                ch.breadcrumbs, 
                'children', 
                (
                  SELECT 
                    jsonb_agg(
                      grandchild_data 
                      ORDER BY 
                        grandchild_data ->> 'display_order' ASC
                    ) 
                  FROM 
                    (
                      SELECT 
                        jsonb_build_object(
                          'id', 
                          c_grandchild.id, 
                          'name', 
                          c_grandchild.name, 
                          'type', 
                          c_grandchild.type, 
                          'status', 
                          c_grandchild.status, 
                          'breadcrumbs', 
                          CONCAT(
                            ch.breadcrumbs, ' > ', c_child.name
                          )
                        ) as grandchild_data 
                      FROM 
                        "deal_category_view_${language}" c_grandchild 
                      WHERE 
                        c_grandchild."parentId" = c_child.id 
                        AND c_grandchild.type = '${DealCategoryType.SMALL}'
                      ORDER BY
                        c_grandchild."display_order" ASC
                    ) as grandchild_results
                )
              ) as child_data 
            FROM 
              "deal_category_view_${language}" c_child 
            WHERE 
              c_child."parentId" = c."id" 
              AND c_child.type IN ('${DealCategoryType.MIDDLE}', '${DealCategoryType.SMALL}')
          ) as child_results
      ) AS children 
    FROM 
      "deal_category_view_${language}" c 
      JOIN CategoryHierarchy ch ON c.id = ch.id 
    ${where}
    ORDER BY 
      c."display_order" ASC;`

    const data = await this.dealCategoryRepository.query(sql)

    return {
      data,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
