import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MyService } from '@app/src/shared/base'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { ProfileService } from '@app/src/users/profile/profile.service'
import { DonationsService } from '@app/src/donations/donations.service'
import { AddressService } from '@app/src/users/address/address.service'
import { NotificationsService } from '@app/src/notifications/notifications.service'
import { RecurringDonationsService } from '@app/src/recurring-donations/recurring-donations.service'
import {
  showService,
  blockService,
  reviewService,
  showOneService,
  unblockService,
  adminMemoService,
  changeEmailService,
  markVerifiedService,
  profileReviewService,
  changeUsertypeService,
  identityDetailService,
  identityRequestsService,
} from './services'
@Injectable()
export class UsersService extends MyService<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly profileService: ProfileService,
    private readonly notificationsService: NotificationsService,
    private readonly addressService: AddressService,
    private readonly donationsService: DonationsService,
    private readonly recurringDonationsService: RecurringDonationsService,
  ) {
    super(userRepository, 'admin/users')
  }

  show = showService.bind(this)
  block = blockService.bind(this)
  review = reviewService.bind(this)
  unblock = unblockService.bind(this)
  showOne = showOneService.bind(this)
  adminMemo = adminMemoService.bind(this)
  markVerified = markVerifiedService.bind(this)
  changeEmail = changeEmailService.bind(this)
  profileReview = profileReviewService.bind(this)
  changeUsertype = changeUsertypeService.bind(this)
  identityDetail = identityDetailService.bind(this)
  identityRequests = identityRequestsService.bind(this)
}
