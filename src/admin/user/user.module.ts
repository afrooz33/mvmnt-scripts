import { Module } from '@nestjs/common'
import { AdminUserService } from './user.service'
import { AdminUserController } from './user.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AdminUserEntity } from '@app/src/admin/user/entities/user.entity'

@Module({
  imports: [TypeOrmModule.forFeature([AdminUserEntity])],
  controllers: [AdminUserController],
  providers: [AdminUserService],
  exports: [AdminUserService],
})
export class UserModule {}
