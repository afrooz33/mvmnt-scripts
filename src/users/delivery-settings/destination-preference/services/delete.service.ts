import { NotFoundException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { AccountStatus } from '@app/src/users/user/enums'

export default async function (id: string, userId: string): Promise<SuccessRO> {
  try {
    const user = await this.userService.documentExists({
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

    //check if the destination preference already exists
    const exists = await this.findOne({
      where: {
        id,
        user: {
          id: user.id,
        },
      },
      select: ['id'],
    })

    if (!exists) {
      throw new NotFoundException(ErrorKey.DELIVERY_SETTINGS_NOT_FOUND)
    }

    await this.entityManager.query(
      `DELETE FROM "delivery_destination_provinces" WHERE "destinationCountryId" IN (SELECT "id" FROM "delivery_destination_countries" WHERE "destinationPreferenceId" = $1)`,
      [id],
    )
    await this.entityManager.query(
      `DELETE FROM "delivery_destination_countries" WHERE "destinationPreferenceId" = $1`,
      [id],
    )

    await this.entityManager.delete('delivery_destination_preferences', exists)

    return {
      success: true,
      message: 'Destination preference successfully deleted',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
