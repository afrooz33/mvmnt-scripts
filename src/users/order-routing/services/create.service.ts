import { PreconditionFailedException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { AccountStatus } from '@app/src/users/user/enums'
import { OrderRoutingType } from '@app/src/users/order-routing/enums'
import { UpdateOrderRoutingDto } from '@app/src/users/order-routing/dto'
import { UserAddressStatus, UserAddressType } from '@app/src/users/address/enums'

export default async function (
  payload: Partial<UpdateOrderRoutingDto>,
  userId: string,
): Promise<SuccessRO> {
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

    if (payload.type !== OrderRoutingType.USE_RANKED_SHIPPING_ORIGINS) {
      if (payload?.origin_groups?.length) {
        throw new PreconditionFailedException(ErrorKey.INVALID_ORDER_ROUTING_DETAILS)
      }

      const exist = await this.findOne({
        where: {
          user: {
            id: user.id,
          },
          type: payload.type,
        },
        select: ['id'],
      })

      if (exist) {
        throw new PreconditionFailedException(ErrorKey.ORDER_ROUTING_ALREADY_EXISTS)
      }
    }

    if (payload?.id) {
      await this.documentExists({
        condition: [
          {
            where: {
              id: payload.id,
              user: {
                id: user.id,
              },
            },
            select: ['id'],
          },
        ],
        errorMessage: ErrorKey.ORDER_ROUTING_NOT_FOUND,
      })
    }

    if (payload?.origin_groups?.length) {
      for (const group of payload.origin_groups) {
        if (!group?.origins?.length) {
          throw new PreconditionFailedException(ErrorKey.INVALID_ORDER_ROUTING_DETAILS)
        }

        for (const origin of group.origins) {
          await this.addressService.documentExists({
            condition: [
              {
                where: {
                  id: origin.origin,
                  status: UserAddressStatus.ENABLED,
                  is_personal: false,
                  profile: {
                    user: { id: userId },
                  },
                  type: UserAddressType.SHIPPING,
                },
                select: ['id'],
              },
            ],
            errorMessage: ErrorKey.ADDRESS_NOT_FOUND,
          })
        }
      }
    }

    const maxDisplayOrder = await this.orderRoutingRepository.findOne({
      where: {
        user: {
          id: user.id,
        },
      },
      order: {
        display_order: 'DESC',
      },
      select: ['id', 'display_order'],
    })

    const display_order = maxDisplayOrder ? maxDisplayOrder.display_order + 1 : 0

    let postData: unknown = {
      ...payload,
      user: {
        id: user.id,
      },
      display_order,
    }

    if (payload?.id) {
      postData = {
        ...payload,
        type: payload.type,
        user: {
          id: user.id,
        },
      }
    }

    if (payload?.id) {
      await this.entityManager.transaction(async (transactionalEntityManager) => {
        await transactionalEntityManager.query(
          `
          DELETE FROM "user_order_routing_shipping_origins" "origin"
          WHERE "origin"."groupId" IN (
            SELECT "group"."id" FROM "user_order_routing_shipping_origin_groups" "group"
            WHERE "group"."orderRoutingId" = $1
          );
        `,
          [payload.id],
        )

        await transactionalEntityManager.query(
          `
          DELETE FROM "user_order_routing_shipping_origin_groups" "group"
          WHERE "group"."orderRoutingId" = $1;
        `,
          [payload.id],
        )
      })
    }

    const savedOrderRouting = await this.updateOne(postData)

    return {
      success: true,
      message: 'Order routing created successfully',
      data: savedOrderRouting,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
