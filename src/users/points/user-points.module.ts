import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TokensModule } from '@app/src/admin/tokens/tokens.module'
import { SystemFeeModule } from '@app/src/admin/system-fee/system-fee.module'
import { UserPointsService } from './user-points.service'
import { UserPointsController } from './user-points.controller'
import { UserPointsEntity } from './entities/user-points.entity'
import { UserPointUpdatesEntity } from './entities/user-points-updates.entity'
import { UserPointRedemptionsEntity } from './entities/user-points-redemptions.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserPointsEntity,
      UserPointUpdatesEntity,
      UserPointRedemptionsEntity,
    ]),
    ConfigModule,
    TokensModule,
    SystemFeeModule,
  ],
  providers: [UserPointsService],
  exports: [UserPointsService],
  controllers: [UserPointsController],
})
export class UserPointsModule {}
