import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BannersService } from './banners.service'
import { BannersController } from './banners.controller'
import { BannerEntity } from './entities/banner.entity'
import { ImagesModule } from '@app/src/images/images.module'
import { BannerSubscriber } from './entities/banner.subscriber'

@Module({
  imports: [TypeOrmModule.forFeature([BannerEntity]), ImagesModule],
  controllers: [BannersController],
  providers: [BannersService, BannerSubscriber],
})
export class BannersModule {}
