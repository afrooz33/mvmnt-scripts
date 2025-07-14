import { Not } from 'typeorm'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { ReportReviewDto } from '@app/src/users/deal/review/dto'
import { DealRatingStatus } from '@app/src/users/deal/review/enums'
import { PreconditionFailedException } from '@nestjs/common'

export default async function reportService(
  payload: ReportReviewDto,
  userId: string,
  reviewId: string,
): Promise<SuccessRO> {
  try {
    const review = await this.documentExists({
      condition: [
        {
          where: {
            id: reviewId,
            user: Not(userId),
            status: Not(DealRatingStatus.DELETED),
          },
          select: ['id'],
        },
      ],
      errorMessage: JSON.stringify({
        key: ErrorKey.RESOURCE_NOT_FOUND,
        args: { id: reviewId },
      }),
    })

    const alreadyReported = await this.reviewReportRepository.findOne({
      where: {
        review: {
          id: reviewId,
        },
        user: {
          id: userId,
        },
      },
    })

    if (alreadyReported) {
      throw new PreconditionFailedException(ErrorKey.USER_ALREADY_REPORTED_REVIEW)
    }

    await this.reviewReportRepository.save({
      ...payload,
      review,
      user: {
        id: userId,
      },
    })

    await this.updateOne({
      ...review,
      status: DealRatingStatus.REPORTED,
    })

    return {
      success: true,
      message: 'Review reported successfully',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
