import { Module } from '@nestjs/common'
import { DrawerSettingsController } from './drawer-settings.controller'
import { DrawerSettingsService } from './drawer-settings.service'

@Module({
  imports: [],
  controllers: [DrawerSettingsController],
  providers: [DrawerSettingsService],
  exports: [],
})
export class DrawerSettingsModule {}
