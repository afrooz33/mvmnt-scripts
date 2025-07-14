import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { Query } from '@app/src/shared/enums'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { GuidesQueryDto } from '@app/src/guides/dto'
import { GuideStatus } from '@app/src/admin/guides/enums'

export default async function showService(query: GuidesQueryDto, language: string) {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.guidesRepository)
      .addFilter('level', query.level)
      .addFilter('status', GuideStatus.ENABLED)
      .addRelation(Query.TRANSLATIONS)
      .addRelation(Query.TRANSLATIONS_LANGUAGE)
      .create()

    results.condition.orderBy('data.display_order', 'ASC')

    if (query?.parent) {
      results.condition.andWhere('"data"."parentId" = :parent', { parent: query.parent })
    }

    const paginatedResults = await this.customPaginate(results)

    const filteredData = paginatedResults.data.map((guide) => {
      const matchingTranslation = guide.translations.find(
        (translation) => translation.language.code === language,
      )

      return {
        ...guide,
        name: matchingTranslation ? matchingTranslation.name : guide.name,
        translations: undefined,
      }
    })

    return {
      ...paginatedResults,
      data: filteredData,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
