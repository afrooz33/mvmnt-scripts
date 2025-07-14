import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DonationProjectEntity } from '@app/src/nonprofit/donation-projects/entities/donation-project.entity'
import { DonationProjectsController } from './donation-projects.controller'
import { DonationProjectsService } from './donation-projects.service'

@Module({
  imports: [TypeOrmModule.forFeature([DonationProjectEntity])],
  controllers: [DonationProjectsController],
  providers: [DonationProjectsService],
})
export class DonationProjectsModule {}
