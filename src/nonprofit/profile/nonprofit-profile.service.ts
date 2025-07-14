import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { NonprofitProfileEntity } from './entities/nonprofit-profile.entity'
import { createService, saveService, updateService } from '@app/src/nonprofit/profile/services'
import { MyService } from '@app/src/shared/base'
import { ImagesService } from '@app/src/images/images.service'
import { TagsService } from '@app/src/admin/tags/tags.service'
import { NonprofitUserService } from '@app/src/nonprofit/user/nonprofit-user.service'

@Injectable()
export class NonprofitProfileService extends MyService<NonprofitProfileEntity> {
  constructor(
    @InjectRepository(NonprofitProfileEntity)
    private nonprofitProfileRepository: Repository<NonprofitProfileEntity>,
    private readonly imagesService: ImagesService,
    private readonly tagsService: TagsService,
    private readonly nonprofitUserService: NonprofitUserService,
  ) {
    super(nonprofitProfileRepository, '')
  }

  create = createService.bind(this)
  save = saveService.bind(this)
  update = updateService.bind(this)
}
