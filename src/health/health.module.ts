import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { HttpModule } from '@nestjs/axios'
import { TerminusModule } from '@nestjs/terminus'
import { HealthService } from './health.service'
import { HealthController } from './health.controller'
import { DiskHealthIndicator } from './indicators/disk.health'
import { RedisHealthIndicator } from './indicators/redis.health'
import { MemoryHealthIndicator } from './indicators/memory.health'
import { DatabaseHealthIndicator } from './indicators/database.health'
import { BlockchainHealthIndicator } from './indicators/blockchain.health'

@Module({
  imports: [
    TerminusModule,
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    ConfigModule,
  ],
  controllers: [HealthController],
  providers: [
    HealthService,
    DiskHealthIndicator,
    RedisHealthIndicator,
    MemoryHealthIndicator,
    DatabaseHealthIndicator,
    BlockchainHealthIndicator,
  ],
  exports: [HealthService],
})
export class HealthModule {}
