import { Module } from '@nestjs/common'
import { RankService } from './rank.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PaymentWalletsEntity } from '@app/src/users/payment-method/entities/payment-wallets.entity'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { UserRankHistoryEntity } from './entities/rank-history'
import { RankController } from './rank.controller'
import { BrandTokenRequestEntity } from '@app/src/brand-tokens/entities/brand-token-request.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PaymentWalletsEntity,
      UserEntity,
      UserRankHistoryEntity,
      BrandTokenRequestEntity,
    ]),
  ],
  providers: [RankService],
  controllers: [RankController],
  exports: [RankService],
})
export class RankModule {}
