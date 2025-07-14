import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { MyService } from '@app/src/shared/base'
import { DealService } from '@app/src/users/deal/deal.service'
import { NotificationsService } from '@app/src/notifications/notifications.service'
import { DealReviewEntity } from './entities/review.entity'
import { ReviewReportEntity } from './entities/review-report.entity'
import {
  createService,
  reportService,
  listReviewService,
  reviewStatsService,
  publicReviewService,
  listPendingReviewsService,
} from './services'

@Injectable()
export class DealReviewService extends MyService<DealReviewEntity> {
  constructor(
    @InjectRepository(DealReviewEntity)
    private readonly dealReviewRepository: Repository<DealReviewEntity>,
    @InjectRepository(ReviewReportEntity)
    private readonly reviewReportRepository: Repository<ReviewReportEntity>,
    private readonly notificationsService: NotificationsService,
    private readonly dealService: DealService,
    private readonly entityManager: EntityManager,
  ) {
    super(dealReviewRepository, 'user/deal/reviews')
  }

  create = createService.bind(this)
  report = reportService.bind(this)
  listReview = listReviewService.bind(this)
  reviewStats = reviewStatsService.bind(this)
  publicReview = publicReviewService.bind(this)
  listPendingReviews = listPendingReviewsService.bind(this)
}
