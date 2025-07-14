import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserModule } from '@app/src/users/user/user.module'
import { ImagesModule } from '@app/src/images/images.module'
import { FollowerEntity } from '@app/src/users/follower/entities/follower.entity'
import { ActivityReportEntity } from './entities/activity-report.entity'
import { ActivityReportsController } from './activity-reports.controller'
import { ActivityReportsService } from './activity-reports.service'
import { ActivityReportAssetsEntity } from './entities/activity-report-assets.entity'
import { ActivityReportCommentEntity } from './entities/activity-report-comment.entity'
import { ActivityReportBookmarkEntity } from './entities/activity-report-bookmark.entity'
import { AssetsService } from './assets.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FollowerEntity,
      ActivityReportEntity,
      ActivityReportAssetsEntity,
      ActivityReportBookmarkEntity,
      ActivityReportCommentEntity,
    ]),
    UserModule,
    ImagesModule,
  ],
  controllers: [ActivityReportsController],
  providers: [ActivityReportsService, AssetsService, ConfigService],
  exports: [ActivityReportsService],
})
export class ActivityReportsModule {}
