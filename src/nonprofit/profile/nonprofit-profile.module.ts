import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { NonprofitProfileEntity } from '@app/src/nonprofit/profile/entities/nonprofit-profile.entity'
import { NonprofitProfileService } from '@app/src/nonprofit/profile/nonprofit-profile.service'
import { NonprofitProfileController } from '@app/src/nonprofit/profile/nonprofit-profile.controller'
import { TagsModule } from '@app/src/admin/tags/tags.module'
import { ImagesModule } from '@app/src/images/images.module'
import { NonprofitUserModule } from '@app/src/nonprofit/user/nonprofit-user.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([NonprofitProfileEntity]),
    ImagesModule,
    TagsModule,
    NonprofitUserModule,
  ],
  controllers: [NonprofitProfileController],
  providers: [NonprofitProfileService],
  exports: [NonprofitProfileService],
})
export class NonprofitProfileModule {}
