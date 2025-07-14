import { ILike } from 'typeorm'
import { NotFoundException, PreconditionFailedException } from '@nestjs/common'
import { ErrorKey } from '@app/src/shared/enums'
import { NonprofitGenre } from '@app/src/shared/constant'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { GetUserDonationProjectDonationQuery } from '@app/src/shared/sql'
import { AccountStatus } from '@app/src/nonprofit/user/enums'
import { TagEntity } from '@app/src/admin/tags/entities/tag.entity'

export default async function (genre: string): Promise<any> {
  try {
    const lowerCaseGenre = genre.toLowerCase()
    const isValidGenre = NonprofitGenre.some(
      (validGenre) => validGenre.toLowerCase() === lowerCaseGenre,
    )

    if (!isValidGenre) {
      throw new PreconditionFailedException(ErrorKey.INVALID_GENRE)
    }

    const tag = await this.entityManager.findOne(TagEntity, {
      where: {
        name: ILike(`%${genre}%`),
      },
    })

    if (!tag) {
      throw new PreconditionFailedException(ErrorKey.INVALID_GENRE)
    }

    const nonprofits = await this.entityManager.query(`
      WITH nonprofits_with_reports AS (
        SELECT 
          "nu"."id" AS "id",
          "np"."first_name",
          "np"."last_name",
          "np"."foundation_name",
          "np"."foundation_url",
          (${GetUserDonationProjectDonationQuery({
            isNonprofit: true,
            nonprofitId: '"np"."id"',
            select: 'COALESCE(SUM("donation"."amount"), 0)',
          })}) "donations",
          COALESCE(
            (
              SELECT COUNT(*)
              FROM "activity_reports" "ar"
              JOIN "users" "u" ON "u"."id" = "ar"."userId"
              WHERE "u"."nonprofitId" = "np"."id"
            ), 
            0
          ) AS "total_activity_reports",
          "nu"."created" AS "registered"
        FROM 
          "nonprofit_profiles" "np"
          LEFT JOIN "nonprofit_users" "nu" ON "nu"."id" = "np"."userId"
          LEFT JOIN "nonprofit_profiles_tags_tags" "npt" ON "npt"."nonprofitProfilesId" = "np"."id"
          LEFT JOIN "tags" "t" ON "t"."id" = "npt"."tagsId"
        WHERE 
          "t"."id" = '${tag.id}'
          AND "nu"."account_status" = '${AccountStatus.ACTIVE}'
      )
      SELECT *
      FROM nonprofits_with_reports
      WHERE 
        CASE
          WHEN (SELECT COUNT(*) FROM nonprofits_with_reports WHERE "total_activity_reports" > 0) > 0 THEN "total_activity_reports" > 0
          ELSE true
        END
      ORDER BY 
        "donations" ASC,
        "total_activity_reports" DESC,
        "registered" ASC
      LIMIT 1;
    `)

    if (!nonprofits.length) {
      throw new NotFoundException(ErrorKey.GENRE_NONPROFIT_NOT_FOUND)
    }

    return {
      tag,
      nonprofits: nonprofits[0],
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
