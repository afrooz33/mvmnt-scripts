import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MyService } from '@app/src/shared/base'
import { UserEntity } from './entities/user.entity'
import { LoginActivity } from './entities/login-activity.entity'
import {
  updateOneService,
  getBusinessService,
  saveBusinessService,
  publicProfileService,
  logLoginActivityService,
} from './services'

@Injectable()
export class UserService extends MyService<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    protected readonly userRepository: Repository<UserEntity>,
    @InjectRepository(LoginActivity)
    protected readonly loginActivityRepository: Repository<LoginActivity>,
  ) {
    super(userRepository, 'users')
  }

  updateOne = updateOneService.bind(this)
  getBusiness = getBusinessService.bind(this)
  publicProfile = publicProfileService.bind(this)
  saveBusiness = saveBusinessService.bind(this)
  logLoginActivity = logLoginActivityService.bind(this)
}
