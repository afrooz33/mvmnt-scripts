import { BadRequestException, NotFoundException } from '@nestjs/common'
import { ErrorKey } from '@app/src/shared/enums'
import {
  ReturnExchangeStatus,
  ReturnExchangeLogAction,
} from '@app/src/purchase-history/refund-exchange/enums'
import { ShipReturnExchangeDto } from '@app/src/purchase-history/refund-exchange/dto'
import { OrderReturnExchangeEntity } from '@app/src/purchase-history/refund-exchange/entities/order-return-exchange.entity'
import { OrderReturnExchangeLogEntity } from '@app/src/purchase-history/refund-exchange/entities/order-return-exchange-log.entity'

export default async function (
  buyerId: string,
  returnExchangeId: string,
  payload: ShipReturnExchangeDto,
): Promise<OrderReturnExchangeEntity> {
  // 1) Load the main return/exchange request.
  const returnExchange = await this.returnExchangeRepository.findOne({
    where: { id: returnExchangeId, buyer: { id: buyerId } },
    relations: ['items', 'items.shipments', 'items.cart_item', 'buyer'],
  })

  if (!returnExchange) {
    throw new NotFoundException(ErrorKey.INVALID_RETURN_EXCHANGE)
  }

  const queryRunner = this.dataSource.createQueryRunner()
  await queryRunner.connect()
  await queryRunner.startTransaction()

  try {
    const itemUpdates = []

    // 2) Process each item in the payload.
    for (const shippedItemDto of payload.items) {
      const returnItem = returnExchange.items.find(
        (item) => item.id === shippedItemDto.return_exchange_item,
      )

      if (!returnItem) {
        throw new NotFoundException(ErrorKey.INVALID_RETURN_EXCHANGE_ITEM)
      }

      // 3) Validate status and quantity.
      if (
        ![
          ReturnExchangeStatus.APPROVED,
          ReturnExchangeStatus.PARTIALLY_APPROVED,
          ReturnExchangeStatus.PARTIALLY_SHIPPED, // Allow if partially shipped
        ].includes(returnItem.status)
      ) {
        throw new BadRequestException(ErrorKey.RETURN_EXCHANGE_NOT_APPROVED)
      }

      if (shippedItemDto.quantity <= 0) {
        throw new BadRequestException(ErrorKey.INVALID_QUANTITY)
      }

      // Calculate total shipped quantity INCLUDING PREVIOUS SHIPMENTS
      const totalShippedQuantity = returnItem.shipments.reduce(
        (sum, shipment) => sum + (shipment.quantity || 0),
        0,
      )

      // Check if the CURRENT shipment + PREVIOUS shipments exceeds the approved quantity.
      if (totalShippedQuantity + shippedItemDto.quantity > returnItem.approved_quantity) {
        throw new BadRequestException(ErrorKey.SHIPPED_QUANTITY_EXCEEDS_APPROVED)
      }
      const previousStatus = returnItem.status

      // 4) Create shipment record (NOW WE PROCESS ALL TRACKING INFO SEPARATELY)
      for (const trackingInfo of payload.tracking_info) {
        const shipment = this.returnShipmentRepository.create({
          return_exchange_item: { id: returnItem.id },
          tracking_number: trackingInfo.tracking_number ?? null,
          delivery_carrier: trackingInfo.delivery_carrier ?? null,
          shipped_at: new Date(),
          quantity: shippedItemDto.quantity, // Associate ALL shipments with the item's quantity.
        })
        await queryRunner.manager.save(shipment)
      }

      // 5) Update the item's shipped_quantity and status.
      returnItem.shipped_quantity += shippedItemDto.quantity // Increment shipped quantity
      let newStatus = ReturnExchangeStatus.PROCESSING
      if (returnItem.shipped_quantity < returnItem.approved_quantity) {
        newStatus = ReturnExchangeStatus.PARTIALLY_SHIPPED // Correct partial status
      } else if (returnItem.shipped_quantity === returnItem.approved_quantity) {
        newStatus = ReturnExchangeStatus.SHIPPED
      }
      returnItem.status = newStatus
      await queryRunner.manager.save(returnItem)

      // Prepare item update for logging
      itemUpdates.push({
        item_id: returnItem.cart_item.id,
        previous_status: previousStatus,
        new_status: returnItem.status,
        shipped_quantity: shippedItemDto.quantity,
        total_shipped: returnItem.shipped_quantity,
        tracking_info: payload.tracking_info, // Include ALL tracking info in the log
      })
    }

    // 6) Create a log entry for the overall update.
    await queryRunner.manager.save(OrderReturnExchangeLogEntity, {
      return_exchange: { id: returnExchange.id },
      user: { id: buyerId },
      action: ReturnExchangeLogAction.ITEM_SHIPPED,
      details: {
        items: itemUpdates,
      },
    })

    // 7) Recalculate Main Request Status (Simplified)
    let allShipped = true
    for (const item of returnExchange.items) {
      // Check if ANY item is not fully shipped.
      if (item.status !== ReturnExchangeStatus.SHIPPED) {
        allShipped = false
        break
      }
    }
    if (allShipped) {
      returnExchange.status = ReturnExchangeStatus.SHIPPED
      await queryRunner.manager.save(returnExchange)
    }
    await queryRunner.commitTransaction()
    // 8) Return updated returnExchange request
    const updatedReturnExchange = await this.returnExchangeRepository.findOne({
      where: { id: returnExchangeId },
      relations: ['items', 'items.shipments', 'buyer'],
    })

    return updatedReturnExchange
  } catch (error) {
    await queryRunner.rollbackTransaction()
    throw error
  } finally {
    await queryRunner.release()
  }
}
