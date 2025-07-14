import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MyService } from '@app/src/shared/base'
import { NonprofitUserEntity } from './entities/nonprofit-user.entity'
import {
  showService,
  createService,
  showOneService,
  updateOneService,
  getBlockedUsersService,
} from './services'

@Injectable()
export class NonprofitUserService extends MyService<NonprofitUserEntity> {
  constructor(
    @InjectRepository(NonprofitUserEntity)
    private nonprofitUserRepository: Repository<NonprofitUserEntity>,
  ) {
    super(nonprofitUserRepository, 'nonprofit/users')
  }

  show = showService.bind(this)
  create = createService.bind(this)
  showOne = showOneService.bind(this)
  updateOne = updateOneService.bind(this)
  getBlockedUsers = getBlockedUsersService.bind(this)
}
