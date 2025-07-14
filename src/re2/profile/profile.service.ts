import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { createService, updateService } from '@app/src/re2/profile/services'
import { MyService } from '@app/src/shared/base'
import { ProfileEntity } from '@app/src/re2/profile/entities/profile.entity'
import { UserService } from '@app/src/re2/user/user.service'

@Injectable()
export class ProfileService extends MyService<ProfileEntity> {
  constructor(
    @InjectRepository(ProfileEntity)
    private readonly profileRepository: Repository<ProfileEntity>,
    private readonly userService: UserService,
  ) {
    super(profileRepository, 're2/profiles')
  }

  create = createService.bind(this)
  update = updateService.bind(this)
}
