import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { ShippingProfileStatus } from '@app/src/users/shipping-profiles/enums'

export default async function (id: string, userId: string): Promise<SuccessRO> {
  try {
    const shippingProfile = await this.documentExists({
      condition: [
        {
          where: {
            id,
            user: {
              id: userId,
            },
            status: ShippingProfileStatus.ENABLED,
          },
          select: ['id'],
        },
      ],
      errorMessage: JSON.stringify({
        key: ErrorKey.SHIPPING_PROFILE_NOT_FOUND,
        args: { id },
      }),
    })

    await this.updateOne({
      ...shippingProfile,
      status: ShippingProfileStatus.DELETED,
    })

    return {
      success: true,
      message: 'Shipping profile deleted successfully',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
