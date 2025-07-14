import { In, Not } from 'typeorm'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { DealStatus } from '@app/src/users/deal/enums'
import { DealRatingStatus } from '@app/src/users/deal/review/enums'

export default async function (dealId: string, reviewId: string): Promise<SuccessRO> {
  try {
    const review = await this.dealReviewService.documentExists({
      condition: [
        {
          where: {
            id: reviewId,
            deal: {
              id: dealId,
              status: In([DealStatus.ON_DEAL, DealStatus.SCHEDULED]),
            },
            status: Not(DealRatingStatus.DELETED),
          },
          select: ['id', 'status'],
        },
      ],
      message: ErrorKey.DEAL_REVIEW_NOT_FOUND,
    })

    review.status = DealRatingStatus.DELETED

    await review.save()

    return {
      success: true,
      message: 'Deal review has been deleted successfully.',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
