import { ErrorKey, Query } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { AccountStatus } from '@app/src/users/user/enums'
import { ActivityReportStatus } from '@app/src/users/activity-reports/enums'

export default async function (id: string, userId: string): Promise<any> {
  try {
    if (userId) {
      await this.userService.documentExists({
        condition: [
          {
            where: {
              id: userId,
              account_status: AccountStatus.ENABLED,
            },
            select: ['id'],
          },
        ],
        errorMessage: ErrorKey.USER_NOT_FOUND,
      })
    }

    const results: QueryBuilderDataInterface = new QueryBuilder({})
      .useQuery(this.activityReportsRepository)
      .addRelation(Query.USER)
      .addFilter('id', id)
      .addFilter('status', ActivityReportStatus.PUBLISHED)
      .create()

    results.condition.select([
      'data.id id',
      'data.content content',
      'data.created created',
      'user.id as user_id',
      'user.username as username',
      'user.display_name as display_name',
      `(
        SELECT 
          json_agg("image")
        FROM
          "activity_reports_assets" "assets"
        LEFT JOIN "activity_report_assets" "image" ON "assets"."activityReportAssetsId" = "image"."id"
        WHERE
        "assets"."activityReportsId" = "data"."id"
      ) AS "assets"`,
      `CASE
        WHEN user.nonprofitId IS NOT NULL THEN (
          SELECT
            json_build_object(
              'first_name', "profiles"."first_name",
              'last_name', "profiles"."last_name",
              'description', "profiles"."introduction",
              'foundation_name', "profiles"."foundation_name",
              'foundation_url', "profiles"."foundation_url",
              'image', "profile_images"."url"
            )
          FROM "nonprofit_users" "users"
          LEFT JOIN "nonprofit_profiles" "profiles" ON "users"."id" = "profiles"."userId"
          LEFT JOIN "images" "profile_images" ON "profiles"."profileImageId" = "profile_images"."id"
          WHERE "users"."id" = "user"."nonprofitId"
        )
      ELSE NULL
      END AS nonprofit_info`,
      `${
        userId
          ? `
        (
          SELECT EXISTS(
            SELECT 1 FROM "activity_report_bookmarks" 
            WHERE "activityReportId" = "data"."id" AND "userId" = '${userId}'
          )
        ) AS "is_bookmarked"
      `
          : 'false AS "is_bookmarked"'
      }`,
    ])

    return await results.condition.getRawOne()
  } catch (error) {
    return HandleErrors(error)
  }
}
