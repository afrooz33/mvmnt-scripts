import { PaginateRO } from '@app/src/shared/dto'
import { QueryDto } from '@app/src/notifications/dto'
import { GetDealFirstImageQuery } from '@app/src/shared/sql'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { NotificationRelatedTo, NotificationReceiverType } from '@app/src/notifications/enums'

export default async function showService(query: QueryDto, userId: string): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.notificationRepository)
      .addFilter('user.id', userId)
      .create()

    if (query?.related_to) {
      results.condition.andWhere('"data"."related_to" IN (:...related_to)', {
        related_to: query.related_to,
      })
    }

    results.condition.andWhere('"data"."receiver_type" = :receiver_type', {
      receiver_type: NotificationReceiverType.USER,
    })

    results.condition.select([
      'data.id as id',
      'data.title as title',
      'data.related_to as related_to',
      'data.receiver_type as receiver_type',
      'data.type as type',
      'data.status as status',
      'data.created as created',
      'data.data::jsonb as details',
    ])

    if (query?.related_to?.includes(NotificationRelatedTo.DEAL)) {
      results.condition.leftJoin('deals', 'deal', `(data::jsonb ->> 'deal')::uuid = "deal"."id"`)

      results.condition.leftJoin('users', 'deal_user', 'deal_user.id = "deal"."userId"')

      results.condition.addSelect([
        'deal.id as deal_id',
        'deal.name as deal_name',
        'deal_user.id as seller_id',
        'deal.deal_type as deal_type',
        'deal_user.username as seller_username',
        'deal_user.account_type as seller_account_type',
        'deal_user.is_verified as seller_is_verified',
        `${GetDealFirstImageQuery('"deal"."deal_type"', '"deal"."id"')}`,
      ])
    }

    if (query?.related_to?.includes(NotificationRelatedTo.USER)) {
      results.condition.leftJoin(
        'users',
        'user',
        `(data::jsonb ->> 'follower')::uuid = "user"."id"`,
      )

      results.condition.addSelect([
        'user.id as user_id',
        'user.username as user_username',
        'user.account_type as user_account_type',
        `(SELECT
          "images"."url"
          FROM
            "images"
          WHERE
            "images"."id" = (SELECT
                "user_profiles"."profileImagesId"
              FROM
                "user_profiles"
              WHERE
                "user_profiles"."userId" = (data::jsonb ->> 'follower')::uuid)) as "user_profile_image"`,
      ])
    }

    if (query?.related_to?.includes(NotificationRelatedTo.NONPROFIT)) {
      results.condition.leftJoin(
        'nonprofit_profiles',
        'nonprofit',
        `(data::jsonb ->> 'nonprofitId')::uuid = "nonprofit"."userId"`,
      )

      results.condition.addSelect([
        'nonprofit.userId as nonprofit_id',
        'nonprofit.first_name as nonprofit_first_name',
        'nonprofit.last_name as nonprofit_last_name',
        `(SELECT
          "images"."url"
          FROM
            "images"
          WHERE
            "images"."id" = "nonprofit"."profileImageId") as "nonprofit_profile_image"`,
      ])
    }

    if (query?.related_to?.includes(NotificationRelatedTo.DONATION_PROJECT)) {
      results.condition.leftJoin(
        'donation_projects',
        'donation_project',
        `(data::jsonb ->> 'donationProjectId')::uuid = "donation_project"."id"`,
      )

      results.condition.addSelect([
        'donation_project.id as donation_project_id',
        'donation_project.name as donation_project_name',
        'donation_project.nonprofitId as donation_project_nonprofit_id',
        `(SELECT
            "images"."url"
          FROM
            "images"
          LEFT JOIN
            "donation_projects_images_images" "donation_project_images"
              ON "donation_project_images"."imagesId" = "images"."id" LIMIT 1) as "donation_project_image"`,
      ])
    }

    return await this.rawPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
