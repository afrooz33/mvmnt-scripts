import { PreconditionFailedException } from '@nestjs/common'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { DealStatus } from '@app/src/users/deal/enums'
import { DeleteDealDto } from '@app/src/users/deal/dto'
import { BidStatus } from '@app/src/users/deal/bid/enums'
import { RestrictionType } from '@app/src/users/restrictions/enums'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'
import { RestrictionsEntity } from '@app/src/users/restrictions/entities/restrictions.entity'

export default async function (
  id: string,
  userId: string,
  restriction: RestrictionsEntity,
  deal: DealEntity,
  payload: DeleteDealDto,
): Promise<any> {
  try {
    const dealAwarded = await this.dealRepository.query(`SELECT
      "id"
    FROM
      "user_deal_bids"
    WHERE
      "dealId" = '${id}'
        AND status IN ('${BidStatus.AWARDED}', '${BidStatus.COMPLETED}', '${BidStatus.WAITING_SHIPMENT}');`)

    if (dealAwarded.length) {
      throw new PreconditionFailedException(ErrorKey.DEAL_CANNOT_DELETE_TERMINATED)
    }

    const total_bidder = await this.dealRepository.query(`SELECT
        "users"."id",
        "users"."email",
        "users"."username"
      FROM
        "user_deal_bids"
      LEFT JOIN "users" ON "users"."id" = "user_deal_bids"."userId"
      WHERE
        "dealId" = '${id}';`)

    const restrictionPayload = {
      ...restriction,
      user: userId,
      restriction_type: RestrictionType.AUCTION_DEAL_DELETION,
      data: {
        remaining_deletion: 4,
        restriction_date: null,
        total_deletion: 1,
      },
    }

    if (restriction) {
      restrictionPayload.data = {
        restriction_date:
          restriction.data.remaining_deletion === 1
            ? new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).setHours(0, 0, 0, 0)
            : restriction.data.restriction_date,
        remaining_deletion:
          restriction.data.remaining_deletion === 1 ? 5 : restriction.data.remaining_deletion - 1,
        total_deletion: restriction.data.total_deletion + 1,
      }
    }

    // Send emails in batches of 10 users to avoid rate limiting
    const batchSize = 10

    if (total_bidder.length) {
      if (!payload.reason_to_delete) {
        throw new PreconditionFailedException(ErrorKey.REASON_TO_DELETE_REQUIRED)
      }

      for (let i = 0; i < total_bidder.length; i += batchSize) {
        const batch = total_bidder.slice(i, i + batchSize)
        await Promise.all(
          batch.map((user) =>
            this.mailService.auctionDeleted({
              email: user.email,
              username: user.username,
              data: {
                dealId: id,
                dealName: deal.name,
              },
            }),
          ),
        )
      }

      await this.updateOne({
        ...deal,
        status: DealStatus.TERMINATED,
      })
    } else {
      await this.dealRepository.query(`DELETE FROM "deal_shipping_fees" WHERE "dealId" = '${id}';`)

      await this.dealRepository.delete({ id })
    }

    // Update restriction once the deal is deleted or terminated
    await this.restrictionService.updateOne(restrictionPayload)
  } catch (error) {
    return HandleErrors(error)
  }
}
