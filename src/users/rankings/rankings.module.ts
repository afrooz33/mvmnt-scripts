import { Module } from '@nestjs/common'
import { UserModule } from '@app/src/users/user/user.module'
import { StarsModule } from '@app/src/users/stars/stars.module'
import { RankingsController } from './rankings.controller'
import { RankingsService } from './rankings.service'

@Module({
  imports: [UserModule, StarsModule],
  controllers: [RankingsController],
  providers: [RankingsService],
  exports: [RankingsService],
})
export class RankingsModule {}
