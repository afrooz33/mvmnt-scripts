import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { HomepagesService } from './homepages.service'
import { HomepagesController } from './homepages.controller'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { UserDonationsEntity } from '@app/src/donations/entities/donations.entity'
import { HomepagesEntity } from '@app/src/admin/homepages/entities/homepages.entity'
import { HomepageContentEntity } from '@app/src/admin/homepages/entities/homepage-content.entity'
import { RecentlyViewedDealEntity } from '@app/src/users/deal/recently-viewed/entities/recently-viewed.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DealEntity,
      UserEntity,
      UserDonationsEntity,
      HomepagesEntity,
      HomepageContentEntity,
      RecentlyViewedDealEntity,
    ]),
  ],
  controllers: [HomepagesController],
  providers: [HomepagesService],
})
export class HomepagesModule {}
