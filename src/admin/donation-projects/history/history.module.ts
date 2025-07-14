import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DonationProjectsModule } from '@app/src/nonprofit/donation-projects/donation-projects.module'
import { HistoryService } from './history.service'
import { HistoryEntity as DonationProjectHistoryEntity } from './entities/history.entity'

@Module({
  imports: [TypeOrmModule.forFeature([DonationProjectHistoryEntity]), DonationProjectsModule],
  providers: [HistoryService],
  exports: [HistoryService],
})
export class HistoryModule {}
