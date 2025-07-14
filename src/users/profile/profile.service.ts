import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MyService } from '@app/src/shared/base'
import { UserService } from '@app/src/users/user/user.service'
import { ImagesService } from '@app/src/images/images.service'
import { AddressService } from '@app/src/users/address/address.service'
import { ProfileEntity } from '@app/src/users/profile/entities/profile.entity'
import { NotificationsService } from '@app/src/notifications/notifications.service'
import { UserIdentityDocumentsEntity } from './entities/user_identity_documents.entity'
import {
  updateService,
  removeSnsService,
  snsConnectService,
  verificationService,
  getSnsProfileService,
  getSnsLoginUrlService,
  getVerificationService,
  removeProfileImageService,
} from './services'

@Injectable()
export class ProfileService extends MyService<ProfileEntity> {
  constructor(
    @InjectRepository(ProfileEntity)
    private readonly profileRepository: Repository<ProfileEntity>,
    @InjectRepository(UserIdentityDocumentsEntity)
    private readonly identityDocumentRepository: Repository<UserIdentityDocumentsEntity>,
    private imagesService: ImagesService,
    private readonly userService: UserService,
    private readonly addressService: AddressService,
    private readonly notificationsService: NotificationsService,
  ) {
    super(profileRepository, 'users/profile')
  }

  update = updateService.bind(this)
  removeSns = removeSnsService.bind(this)
  snsConnect = snsConnectService.bind(this)
  verification = verificationService.bind(this)
  getSnsProfile = getSnsProfileService.bind(this)
  getVerification = getVerificationService.bind(this)
  getSnsLoginUrl = getSnsLoginUrlService.bind(this)
  removeProfileImage = removeProfileImageService.bind(this)
}
