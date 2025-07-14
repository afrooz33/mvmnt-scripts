import { NotFoundException } from '@nestjs/common'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { CheckNonprofitDonationQuery } from '@app/src/shared/sql/common.sql'
import { AccountStatus } from '@app/src/users/user/enums'
import { DONATION_STATUS } from '@app/src/donations/enums'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
export default async function (donorId: string, userId: string): Promise<any> {
  try {
    const user: UserEntity = await this.userService.findOne({
      where: {
        id: donorId,
        account_status: AccountStatus.ENABLED,
      },
      relations: [Query.PROFILE, Query.PROFILE_IMAGES],
      select: [
        'id',
        'email',
        'username',
        'display_name',
        'gender',
        'account_type',
        'account_status',
        'profile',
      ],
    })

    if (!user) {
      throw new NotFoundException(ErrorKey.USER_NOT_FOUND)
    }

    const entityManager = this.donationsRepository.manager

    const total_donations = await entityManager.query(
      `(SELECT COALESCE(SUM("donations"."amount"), 0) as total_donations
          FROM "user_donations" "donations"
          WHERE "userId" = $1
            AND "status" IN ($2, $3)
            AND ${CheckNonprofitDonationQuery('donations', '$4')})`,
      [donorId, DONATION_STATUS.COMPLETED, DONATION_STATUS.SETTLED, userId],
    )

    const addresses = await entityManager.query(
      `SELECT
        "address"."state",
        "address"."city",
        "address"."street",
        "address"."building",
        "address"."phone_number",
        "postcode"."postcode",
        "country"."name" as country_name,
        "country"."code" as country_code
      FROM "user_addressess" "address"
      LEFT JOIN "user_profiles" "profile" ON "profile"."id" = "address"."profileId"
      LEFT JOIN "postcodes" "postcode" ON "postcode"."id" = "address"."postcodeId"
      LEFT JOIN "countries" "country" ON "country"."id" = "postcode"."countryId"
      WHERE "profile"."userId" = $1
        AND "address"."is_default" = true
      LIMIT 1`,
      [donorId],
    )

    return {
      ...user,
      addresses: addresses.length ? addresses[0] : null,
      total_donations: total_donations[0].total_donations,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
