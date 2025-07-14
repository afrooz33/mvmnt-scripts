import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'

export default async function (id: string, userId: string): Promise<SuccessRO> {
  try {
    const orderRouting = await this.documentExists({
      condition: [
        {
          where: {
            id,
            user: {
              id: userId,
            },
          },
          select: ['id'],
        },
      ],
      errorMessage: ErrorKey.ORDER_ROUTING_NOT_FOUND,
    })

    await this.orderRoutingRepository.query(
      `DELETE FROM "user_order_routing_shipping_origins" WHERE "groupId" IN (
        SELECT "group"."id" FROM "user_order_routing_shipping_origin_groups" "group"
        WHERE "group"."orderRoutingId" = '${orderRouting.id}'
      );`,
    )

    await this.orderRoutingRepository.query(
      `DELETE FROM "user_order_routing_shipping_origin_groups" WHERE "orderRoutingId" = '${orderRouting.id}'`,
    )

    await this.orderRoutingRepository.delete(orderRouting)

    return {
      success: true,
      message: 'Order routing successfully deleted',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
