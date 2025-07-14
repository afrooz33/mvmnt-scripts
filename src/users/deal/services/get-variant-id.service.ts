import { Query } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { DealStatus } from '@app/src/users/deal/enums'
import { GetVariantIdDto } from '@app/src/users/deal/dto'

export default async function (query: GetVariantIdDto, dealId: string): Promise<any> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.dealVariantRepository)
      .addRelation(Query.DEAL)
      .addRelation(Query.SINGLE_OPTION_VALUES)
      .addRelation(Query.OPTION_VALUES_OPTION)
      .create()

    results.condition.andWhere('"deal"."id" = :dealId', { dealId })
    results.condition.andWhere('"deal"."status" IN (:...dealStatus)', {
      dealStatus: [DealStatus.ON_DEAL, DealStatus.ENDED],
    })

    let andOrCondition

    if (query?.color) {
      andOrCondition = `("option"."type" = 'COLOR' AND (LOWER("option_values"."label_name") = LOWER(:color) OR LOWER("option_values"."value") = LOWER(:color)))`
    }

    if (query?.size) {
      andOrCondition += ` OR ("option"."type" = 'SIZE' AND LOWER("option_values"."value") = LOWER(:size))`
    }

    if (query?.material) {
      andOrCondition += ` OR ("option"."type" = 'MATERIAL' AND LOWER("option_values"."value") = LOWER(:material))`
    }

    if (query?.weight) {
      andOrCondition += ` OR ("option"."type" = 'WEIGHT' AND LOWER("option_values"."value") = LOWER(:weight))`
    }

    results.condition.andWhere(`(${andOrCondition})`, {
      color: query.color,
      size: query.size,
      material: query.material,
      weight: query.weight,
    })

    results.condition.select(['data.id as id'])
    results.condition.groupBy(['data.id'])
    results.condition.having(
      `COUNT(DISTINCT "option"."type") = ${
        Object.keys(query).filter((key) => key !== 'dealId').length
      }`,
    )
    results.condition.orderBy('data.created', 'DESC')

    return await results.condition.getRawOne()
  } catch (error) {
    return HandleErrors(error)
  }
}
