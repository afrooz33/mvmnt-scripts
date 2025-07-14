import { TypeOrmModule } from '@nestjs/typeorm'
import { Module, forwardRef } from '@nestjs/common'
import { DealModule } from '@app/src/users/deal/deal.module'
import { NonprofitUserService } from './nonprofit-user.service'
import { NonprofitUserController } from './nonprofit-user.controller'
import { NonprofitUserEntity } from './entities/nonprofit-user.entity'

@Module({
  imports: [TypeOrmModule.forFeature([NonprofitUserEntity]), forwardRef(() => DealModule)],
  controllers: [NonprofitUserController],
  providers: [NonprofitUserService],
  exports: [NonprofitUserService],
})
export class NonprofitUserModule {}
