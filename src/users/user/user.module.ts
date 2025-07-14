import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserService } from './user.service'
import { UserController } from './user.controller'
import { UserEntity } from './entities/user.entity'
import { LoginActivity } from './entities/login-activity.entity'
import { UserSessionEntity } from './entities/user-session.entity'
import { UserBusinessShopInfoEntity } from './entities/user_business_shop_info.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      LoginActivity,
      UserSessionEntity,
      UserBusinessShopInfoEntity,
    ]),
  ],
  providers: [UserService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
