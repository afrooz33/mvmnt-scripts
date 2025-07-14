import { Query } from '@app/src/shared/enums'
import { PaginateRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { QueryCommentDto } from '@app/src/users/activity-reports/dto'

export default async function (
  query: QueryCommentDto,
  activity_report: string,
): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.activityReportCommentsRepository)
      .addFilter('activity_report', activity_report)
      .addRelation(Query.USER)
      .addRelation(`${Query.USER}.${Query.PROFILE}`)
      .addRelation(Query.PROFILE_IMAGES)
      .create()

    if (query?.user) {
      results.condition.andWhere('user', query.user)
    }

    results.condition.andWhere('"data"."parentId" IS NULL')

    results.condition.select([
      'data.id id',
      'data.comment comment',
      'data.created created',
      'user.id user_id',
      'user.username username',
      'user.display_name display_name',
      'profile.id profile_id',
      'profile_images.url profile_image',
      `(
        SELECT
          json_agg(json_build_object(
            'id', "id",
            'username', "username",
            'display_name', "display_name"
          ))
        FROM
          (
            SELECT DISTINCT
              "u"."id",
              "u"."username",
              "u"."display_name"
            FROM
              "activity_report_comment_mentions" "comment_mentions"
            LEFT JOIN "activity_report_comments" "comments" ON "comments"."id" = "comment_mentions"."activityReportCommentsId"
            LEFT JOIN "users" "u" ON "u"."id" = "comments"."userId"
            WHERE "comments"."activityReportId" = "data"."activityReportId"
          ) AS distinct_users
      ) as mentioned_users`,
    ])

    const comments = await this.rawPaginate(results)

    const enrichedComments = await Promise.all(
      comments.data.map(async (comment) => {
        const replyQuery = this.activityReportCommentsRepository
          .createQueryBuilder('reply')
          .where('reply."parentId" = :parentCommentId', { parentCommentId: comment.id })
          .leftJoinAndSelect('reply.user', 'user')
          .leftJoinAndSelect('user.profile', 'profile')
          .leftJoinAndSelect('profile.profile_images', 'profile_image')
          .orderBy('reply.created', 'ASC')
          .select([
            'reply.id',
            'reply.comment',
            'reply.created',
            'user.id',
            'user.username',
            'user.display_name',
            'profile.id',
            'profile_image.url',
          ])
          .limit(2)

        const totalReplies = await this.activityReportCommentsRepository
          .createQueryBuilder('reply')
          .where('reply."parentId" = :parentId', { parentId: comment.id })
          .getCount()

        const replies = await replyQuery.getMany()

        return {
          id: comment.id,
          comment: comment.comment,
          created: comment.created,
          mentioned_users: comment.mentioned_users,
          user: {
            id: comment.user_id,
            username: comment.username,
            display_name: comment.display_name,
            profile: {
              id: comment.profile_id,
              profile_images: {
                url: comment.profile_image,
              },
            },
          },
          replies,
          total_replies: totalReplies,
        }
      }),
    )

    return {
      ...comments,
      data: enrichedComments,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
