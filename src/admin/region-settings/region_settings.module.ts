import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RegionSettingsService } from './region_settings.service'
import { RegionSettingsController } from './region_settings.controller'
import { RegionSettingsEntity } from './entities/region_settings.entity'

@Module({
  imports: [TypeOrmModule.forFeature([RegionSettingsEntity])],
  controllers: [RegionSettingsController],
  providers: [RegionSettingsService],
  exports: [RegionSettingsService],
})
export class RegionSettingsModule {}
