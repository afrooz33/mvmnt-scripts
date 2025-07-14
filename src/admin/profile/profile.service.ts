import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MyService } from '@app/src/shared/base'
import { AdminProfileEntity } from './entities/profile.entity'
import { updateService } from './services'
import { AdminUserService } from '@app/src/admin/user/user.service'
@Injectable()
export class AdminProfileService extends MyService<AdminProfileEntity> {
  constructor(
    @InjectRepository(AdminProfileEntity)
    private readonly adminProfileRepository: Repository<AdminProfileEntity>,
    private readonly adminUserService: AdminUserService,
  ) {
    super(adminProfileRepository, '')
  }

  update = updateService.bind(this)
}
