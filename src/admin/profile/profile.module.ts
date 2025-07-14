import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserModule } from '@app/src/admin/user/user.module'
import { AdminProfileController } from './profile.controller'
import { AdminProfileService } from './profile.service'
import { AdminProfileEntity } from './entities/profile.entity'

@Module({
  imports: [TypeOrmModule.forFeature([AdminProfileEntity]), UserModule],
  controllers: [AdminProfileController],
  providers: [AdminProfileService],
  exports: [AdminProfileService],
})
export class AdminProfileModule {}
