import { BadRequestException } from '@nestjs/common'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'

export default async function (deal: DealEntity): Promise<any> {
  try {
    const total_purchase = await this.dealRepository.query(
      `SELECT COUNT(*)::int as "count" FROM "user_deal_item_payment" "purchases" WHERE "purchases"."dealId" = $1`,
      [deal.id],
    )

    if (total_purchase[0].count) {
      throw new BadRequestException(ErrorKey.DEAL_CANNOT_DELETE)
    } else {
      await this.dealRepository.query(`DELETE FROM "deal_variants" WHERE "dealId" = '${deal.id}'`)
      await this.dealRepository.query(
        `DELETE FROM "deal_shipping_fees" WHERE "dealId" = '${deal.id}'`,
      )
      await this.dealRepository.delete({ id: deal.id })
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
