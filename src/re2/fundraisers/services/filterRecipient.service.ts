import { Query } from '@app/src/shared/enums'
import { PaginateRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { DONATION_STATUS } from '@app/src/donations/enums'
import { AccountStatus } from '@app/src/nonprofit/user/enums'
import { FilterRecipientDto } from '@app/src/re2/fundraisers/dto'
import { FilterRecipientOrderBy } from '@app/src/re2/fundraisers/enums'
import { DonationProjectStatus } from '@app/src/nonprofit/donation-projects/enums'
import { GetDonationProjectImageQuery } from '@app/src/shared/sql'

export default async function (query: FilterRecipientDto): Promise<PaginateRO> {
  try {
    let total_donation = `(SELECT SUM("amount")
      FROM
        "user_donations"
      WHERE
        "donationProjectId" = "data"."id" AND "status" IN ('${DONATION_STATUS.COMPLETED}', '${DONATION_STATUS.SETTLED}'))`

    let results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.nonprofitUserRepository)
      .addRelation(Query.PROFILE)
      .addRelation(Query.NONPROFIT_PROFILE_IMAGE)
      .addFilter('account_status', AccountStatus.ACTIVE)
      .create()

    if (query.type === Query.DONATION_PROJECT) {
      results = new QueryBuilder(query)
        .useQuery(this.donationProjectRepository)
        .addRelation(Query.USER)
        .addRelation(Query.USER_PROFILE)
        .addFilter('status', DonationProjectStatus.PUBLISHED)
        .create()

      results.condition.select([
        'data.id as id',
        'data.name as name',
        'data.introduction as introduction',
        'data.description as description',
        `${GetDonationProjectImageQuery(
          `"data"."id" = "donation_project_images"."donationProjectsId"`,
        )} as "image"`,
        'user.id as nonprofit_id',
        'profile.first_name as nonprofit_first_name',
        'profile.last_name as nonprofit_last_name',
        'profile.foundation_name as nonprofit_foundation_name',
        `${total_donation} as total_donation`,
      ])
    } else {
      total_donation = `(SELECT SUM("donations"."amount")
        FROM "user_donations" "donations"
        WHERE "donations"."donationProjectId" = (SELECT "id" FROM "donation_projects" WHERE "userId" = "data"."id" AND "status" = '${DonationProjectStatus.DEFAULT}') AND "donations"."status" IN ('${DONATION_STATUS.COMPLETED}', '${DONATION_STATUS.SETTLED}'))`

      results.condition.select([
        'data.id as id',
        'profile.first_name as first_name',
        'profile.last_name as last_name',
        'profile.introduction as introduction',
        'profile.foundation_name as foundation_name',
        'profile_image.url as image',
        `${total_donation} as total_donation`,
        `(
          SELECT 
            JSON_AGG(donation_projects)
          FROM (
            SELECT 
              "donation_projects"."id",
              "donation_projects"."name",
              SUM("user_donations"."amount") AS total_donation,
              ${GetDonationProjectImageQuery(
                `"donation_projects"."id" = "donation_project_images"."donationProjectsId"`,
              )} as "image"
            FROM 
              "donation_projects"
            LEFT JOIN 
              "user_donations" ON "user_donations"."donationProjectId" = "donation_projects"."id" AND "user_donations"."status" IN ('${
                DONATION_STATUS.COMPLETED
              }', '${DONATION_STATUS.SETTLED}')
            WHERE 
              "donation_projects"."userId" = "data"."id"
            GROUP BY 
              "donation_projects"."id"
            ORDER BY 
              total_donation DESC 
            LIMIT 3
          ) AS donation_projects
        ) AS donation_projects`,
      ])
    }

    if (query.keyword) {
      if (query.type === Query.NONPROFIT) {
        results.condition.addRelation(Query.PROFILE)

        results.condition.andWhere(
          `(profile.first_name ILIKE :keyword OR profile.last_name ILIKE :keyword OR profile.foundation_name ILIKE :keyword)`,
          {
            keyword: `%${query.keyword}%`,
          },
        )
      } else {
        results.condition.andWhere('"data"."name" ILIKE :keyword', {
          keyword: `%${query.keyword}%`,
        })
      }
    }

    if (query.order_by) {
      switch (query.order_by) {
        case FilterRecipientOrderBy.DONATION_PROJECT_NAME:
          results.condition.orderBy('"data"."name"', query.order_direction)
          break
        case FilterRecipientOrderBy.NONPROFIT_NAME:
          results.condition.orderBy('"profile"."foundation_name"', query.order_direction)
          break
        case FilterRecipientOrderBy.TOTAL_DONATION:
          results.condition.orderBy(`${total_donation}`, query.order_direction)
          break
        default:
          if (query.type === Query.DONATION_PROJECT) {
            results.condition.orderBy('"data"."name"', query.order_direction)
          } else {
            results.condition.orderBy('"profile"."foundation_name"', query.order_direction)
          }
          break
      }
    }

    return await this.rawPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
