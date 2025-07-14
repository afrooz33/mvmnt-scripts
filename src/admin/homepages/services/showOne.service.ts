import { BadRequestException } from '@nestjs/common'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { GetDealFirstImageQuery } from '@app/src/shared/sql'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import {
  HomepageStatus,
  ContentSelection,
  HomepageContentSearchType,
} from '@app/src/admin/homepages/enums'

export default async function (id: string): Promise<any> {
  try {
    const result: QueryBuilderDataInterface = new QueryBuilder({})
      .addFilter('id', id)
      .addRelation(Query.TRANSLATIONS)
      .addRelation(Query.TRANSLATIONS_LANGUAGE)
      .addRelation(Query.HOMEPAGE_SEARCH_CONDITION)
      .useQuery(this.homepageRepository)
      .addFilter('status', HomepageStatus.DELETED, true)
      .create()

    const content = await result.condition.getOne()

    if (
      content.search_type === HomepageContentSearchType.USERS &&
      content.selection === ContentSelection.MANUAL
    ) {
      content.contents = await this.homepageContentRepository
        .createQueryBuilder('content')
        .select([
          'content.id AS id',
          `json_build_object(
            'id', u.id,
            'username', u.username,
            'display_name', u.display_name,
            'account_type', u.account_type,
            'profile_images', (
              SELECT images.url 
              FROM images 
              WHERE "images"."id" = (
                SELECT "user_profiles"."profileImagesId" 
                FROM "user_profiles"
                WHERE "user_profiles"."userId" = u."id"
              )
            )
          ) AS user`,
        ])
        .leftJoin('users', 'u', 'u.id = content."userId"')
        .where('"content"."homepageId" = :homepageId', { homepageId: content.id })
        .getRawMany()
    } else if (
      content.search_type === HomepageContentSearchType.DEALS &&
      content.selection === ContentSelection.MANUAL
    ) {
      let dealImage = `${GetDealFirstImageQuery('"deal_type"', '"d"."id"')}`
      dealImage = dealImage.replace(`AS "deal_image"`, '')

      content.contents = await this.homepageContentRepository
        .createQueryBuilder('content')
        .select([
          'content.id AS id',
          `json_build_object(
            'id', d.id,
            'name', d.name,
            'deal_type', d.deal_type,
            'deal_image', ${dealImage},
            'seller', json_build_object(
              'id', u.id,
              'username', u.username,
              'display_name', u.display_name,
              'account_type', u.account_type,
              'profile_image', (
                SELECT images.url 
                FROM images 
                WHERE images.id = up."profileImagesId"
              )
            )
          ) AS deal`,
        ])
        .leftJoin('deals', 'd', 'd.id = content."dealId"')
        .leftJoin('users', 'u', 'u.id = d."userId"')
        .leftJoin('user_profiles', 'up', 'up."userId" = u.id')
        .where('"content"."homepageId" = :homepageId', { homepageId: content.id })
        .getRawMany()
    }

    if (!content) {
      throw new BadRequestException(ErrorKey.HOMEPAGE_NOT_FOUND)
    }

    return content
  } catch (error) {
    return HandleErrors(error)
  }
}
