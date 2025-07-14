import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MyService } from '@app/src/shared/base'
import { AdminUserEntity } from '@app/src/admin/user/entities/user.entity'
import { createService, findByService, updateAdminService, deleteOneService } from './services'

@Injectable()
export class AdminUserService extends MyService<AdminUserEntity> {
  constructor(
    @InjectRepository(AdminUserEntity)
    public adminUserRepository: Repository<AdminUserEntity>,
  ) {
    super(adminUserRepository, '')
  }

  create = createService.bind(this)
  findBy = findByService.bind(this)
  updateAdmin = updateAdminService.bind(this)
  deleteOne = deleteOneService.bind(this)
}
