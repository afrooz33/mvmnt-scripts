import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Re2UserEntity } from './entities/re2-user.entity'
import { UserService } from './user.service'

@Module({
  imports: [TypeOrmModule.forFeature([Re2UserEntity])],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
