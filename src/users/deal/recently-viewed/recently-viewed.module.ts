import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DealModule } from '@app/src/users/deal/deal.module'
import { IsUserDealConstraint } from '@app/src/shared/validations'
import { RecentlyViewedController } from './recently-viewed.controller'
import { RecentlyViewedService } from './recently-viewed.service'
import { RecentlyViewedDealEntity } from './entities/recently-viewed.entity'

@Module({
  imports: [TypeOrmModule.forFeature([RecentlyViewedDealEntity]), forwardRef(() => DealModule)],
  controllers: [RecentlyViewedController],
  providers: [RecentlyViewedService, IsUserDealConstraint],
})
export class RecentlyViewedModule {}
