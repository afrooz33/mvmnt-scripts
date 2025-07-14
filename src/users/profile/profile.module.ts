import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ImagesModule } from '@app/src/images/images.module'
import { UserModule } from '@app/src/users/user/user.module'
import { AddressModule } from '@app/src/users/address/address.module'
import { NotificationsModule } from '@app/src/notifications/notifications.module'
import { ProfileService } from './profile.service'
import { ProfileController } from './profile.controller'
import { ProfileEntity } from './entities/profile.entity'
import { UserIdentityDocumentsEntity } from './entities/user_identity_documents.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([ProfileEntity, UserIdentityDocumentsEntity]),
    UserModule,
    ImagesModule,
    AddressModule,
    NotificationsModule,
  ],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}
