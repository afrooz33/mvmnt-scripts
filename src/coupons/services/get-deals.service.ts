import { PaginateRO } from '@app/src/shared/dto'
import { GetDealFirstImageQuery } from '@app/src/shared/sql'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { GetDealsQueryDto } from '@app/src/coupons/dto'
import { DealStatus, DealType } from '@app/src/users/deal/enums'

export default async function (query: GetDealsQueryDto, userId: string): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.dealService.dealRepository)
      .addFilter('user', userId)
      .create()

    if (query?.status) {
      results.condition.andWhere('"data"."status" IN (:...status)', {
        status: query.status,
      })
    } else {
      results.condition.andWhere('"data"."status" NOT IN (:...deal_status)', {
        deal_status: [DealStatus.DELETED],
      })
    }

    if (query?.keyword) {
      results.condition.andWhere(
        '("data"."name" ILIKE :keyword OR "data"."description" ILIKE :keyword)',
        {
          keyword: `%${query.keyword}%`,
        },
      )
    }

    results.condition.andWhere('"data"."deal_type" IN (:...deal_type)', {
      deal_type: query.deal_type,
    })

    results.condition.select([
      'data.id id',
      'data.name name',
      'data.deal_type deal_type',
      'data.starting_price starting_price',
      `${GetDealFirstImageQuery('"data"."deal_type"', '"data"."id"')}`,
      `CASE WHEN "data"."deal_type" = '${DealType.BUYNOW}' THEN (
        SELECT 
          COALESCE(
            JSON_AGG(
              JSON_BUILD_OBJECT(
                'id', 
                "dv"."id", 
                'price', 
                "dv"."price", 
                'option_values', 
                (
                  SELECT 
                    COALESCE(
                      JSON_AGG(
                        JSON_BUILD_OBJECT(
                          'id', 
                          "dov"."id", 
                          'value', 
                          "dov"."value", 
                          'label_name', 
                          "dov"."label_name", 
                          'option', 
                          JSON_BUILD_OBJECT(
                            'id', "do"."id", 'type', "do"."type"
                          )
                        )
                      ), 
                      '[]'
                    ) 
                  FROM 
                    "deal_option_values" AS "dov" 
                    JOIN "deal_variants_option_values_deal_option_values" AS "dvov" ON "dvov"."dealOptionValuesId" = "dov"."id" 
                    LEFT JOIN "deal_options" AS "do" ON "do"."id" = "dov"."optionId" 
                  WHERE 
                    "dvov"."dealVariantsId" = "dv"."id"
                ), 
                'images', 
                (
                  SELECT 
                    COALESCE(
                      JSON_AGG(
                        JSON_BUILD_OBJECT('url', "i"."url")
                      ), 
                      '[]'
                    ) 
                  FROM 
                    "deal_variants_images_images" AS "dvii" 
                    LEFT JOIN "images" AS "i" ON "i"."id" = "dvii"."imagesId" 
                  WHERE 
                    "dvii"."dealVariantsId" = "dv"."id"
                )
              )
            ), 
            '[]'
          ) 
        FROM 
          "deal_variants" AS "dv"
        WHERE 
          "dv"."dealId" = "data"."id"
      ) END AS "variants"`,
    ])

    return await this.rawPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
