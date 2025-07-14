import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { IsImageAvailableConstraint } from '@app/src/shared/validations'
import { ImagesModule } from '@app/src/images/images.module'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'
import { ReportService } from './report.service'
import { ReportController } from './report.controller'
import { ReportEntity } from './entities/report.entity'

@Module({
  imports: [TypeOrmModule.forFeature([ReportEntity, DealEntity]), ImagesModule],
  controllers: [ReportController],
  providers: [ReportService, IsImageAvailableConstraint],
})
export class ReportModule {}
