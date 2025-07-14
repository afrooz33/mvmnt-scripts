import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RegionSettingsModule } from '@app/src/admin/region-settings/region_settings.module'
import { TokensService } from './tokens.service'
import { TokensController } from './tokens.controller'
import { TokenWhitelistEntity } from './entities/whitelist-tokens.entity'

@Module({
  imports: [TypeOrmModule.forFeature([TokenWhitelistEntity]), ConfigModule, RegionSettingsModule],
  exports: [TokensService],
  providers: [TokensService],
  controllers: [TokensController],
})
export class TokensModule {}
