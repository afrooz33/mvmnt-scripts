import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DealModule } from '@app/src/users/deal/deal.module'
import { NotificationsModule } from '@app/src/notifications/notifications.module'
import { DealReviewController } from './review.controller'
import { DealReviewService } from './review.service'
import { DealReviewEntity } from './entities/review.entity'
import { ReviewReportEntity } from './entities/review-report.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([DealReviewEntity, ReviewReportEntity]),
    NotificationsModule,
    forwardRef(() => DealModule),
  ],
  controllers: [DealReviewController],
  providers: [DealReviewService],
  exports: [DealReviewService],
})
export class DealReviewModule {}
