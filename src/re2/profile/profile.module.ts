import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserModule as Re2UserModule } from '@app/src/re2/user/user.module'
import { ProfileService } from '@app/src/re2/profile/profile.service'
import { ProfileEntity } from '@app/src/re2/profile/entities/profile.entity'
import { ProfileController } from '@app/src/re2/profile/profile.controller'

@Module({
  imports: [TypeOrmModule.forFeature([ProfileEntity]), Re2UserModule],
  controllers: [ProfileController],
  exports: [ProfileService],
  providers: [ProfileService],
})
export class ProfileModule {}
