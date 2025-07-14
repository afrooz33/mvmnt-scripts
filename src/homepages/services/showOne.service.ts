import { Not } from 'typeorm'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { PaginateRO } from '@app/src/shared/dto'
import { ErrorKey, Status } from '@app/src/shared/enums'
import { QueryDto } from '@app/src/homepages/dto'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { PopularEntity } from '@app/src/homepages/enums'
import { HomepageTitle } from '@app/src/admin/homepages/enums'
import { HomepagesEntity } from '@app/src/admin/homepages/entities/homepages.entity'

export default async function (id: string, query: QueryDto): Promise<PaginateRO> {
  try {
    const homepage: HomepagesEntity = await this.documentExists({
      condition: [
        {
          where: {
            id,
            status: Not(Status.DELETED),
          },
          select: ['id', 'type', 'status', 'selection', 'search_type', 'search_conditions'],
          relations: ['search_conditions'],
        },
      ],
      message: ErrorKey.RESOURCE_NOT_FOUND,
    })

    let results: QueryBuilderDataInterface[] = []

    switch (homepage.type) {
      case HomepageTitle.TRENDING_DEALS:
        return await this.trendingDeals(query)
        break
      case HomepageTitle.POPULAR_CATEGORY:
        return await this.listPopular(query, PopularEntity.DEAL_CATEGORIES)
        break
      case HomepageTitle.POPULAR_BRAND:
        return await this.listPopular(query, PopularEntity.BRANDS)
        break
      case HomepageTitle.VIEW_HISTORY:
        results = await this.viewHistory(homepage, query)
        break
      case HomepageTitle.INFLUENCER_RANKING:
        results = await this.influencerRanking(homepage, query)
        break
      case HomepageTitle.BUSINESS_RANKING:
        results = await this.businessRanking(homepage, query)
        break
      case HomepageTitle.EDITOR_PICKS:
        results = await this.customList(homepage, query)
        break
      case HomepageTitle.CATEGORY_LIST:
        return await this.listPopular(query, PopularEntity.DEAL_CATEGORIES, homepage)
        break
      case HomepageTitle.BRAND_LIST:
        return await this.listPopular(query, PopularEntity.BRANDS, homepage)
        break
      case HomepageTitle.USER_LIST:
        results = await this.userList(homepage, query)
        break
      case HomepageTitle.CUSTOM_LIST:
        results = await this.customList(homepage, query)
        break
      default:
        break
    }

    return await this.rawPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
