import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { GuidesController } from './guides.controller'
import { GuidesService } from './guides.service'
import { GuidesEntity } from './entities/guides.entity'
import { GuidesTranslationEntity } from './entities/guides.translation.entity'
import { GuidesSubscriber } from './entities/guides.subscriber'

@Module({
  imports: [TypeOrmModule.forFeature([GuidesEntity, GuidesTranslationEntity])],
  controllers: [GuidesController],
  providers: [GuidesService, GuidesSubscriber],
  exports: [GuidesService],
})
export class GuidesModule {}
