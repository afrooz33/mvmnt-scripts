import { ReorderDto, SuccessRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'

export default async function (payload: ReorderDto, userId: string): Promise<SuccessRO> {
  try {
    await Promise.all(
      payload.items.map((item) => {
        return this.orderRoutingRepository.update(
          {
            id: item.id,
            user: {
              id: userId,
            },
          },
          {
            display_order: item.display_order,
          },
        )
      }),
    )

    return {
      success: true,
      message: 'Resource successfully reordered',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
