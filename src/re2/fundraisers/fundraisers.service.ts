import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MyService } from '@app/src/shared/base'
import { UserService } from '@app/src/re2/user/user.service'
import { ImagesService } from '@app/src/images/images.service'
import { NonprofitUserService } from '@app/src/nonprofit/user/nonprofit-user.service'
import { NonprofitUserEntity } from '@app/src/nonprofit/user/entities/nonprofit-user.entity'
import { DonationProjectsService } from '@app/src/nonprofit/donation-projects/donation-projects.service'
import { DonationProjectEntity } from '@app/src/nonprofit/donation-projects/entities/donation-project.entity'
import { FundraiserEntity } from './entities/fundraisers.entity'
import {
  showService,
  cloneService,
  createService,
  deleteService,
  updateService,
  showOneService,
  changeStatusService,
  filterRecipientService,
} from './services'

@Injectable()
export class FundraiserService extends MyService<FundraiserEntity> {
  constructor(
    @InjectRepository(FundraiserEntity)
    private readonly fundraiserRepository: Repository<FundraiserEntity>,
    private readonly imagesService: ImagesService,
    private readonly nonprofitUserService: NonprofitUserService,
    private readonly donationProjectsService: DonationProjectsService,
    private readonly userService: UserService,
    @InjectRepository(NonprofitUserEntity)
    private readonly nonprofitUserRepository: Repository<NonprofitUserEntity>,
    @InjectRepository(DonationProjectEntity)
    private readonly donationProjectRepository: Repository<DonationProjectEntity>,
  ) {
    super(fundraiserRepository, 're2/fundraisers')
  }

  show = showService.bind(this)
  clone = cloneService.bind(this)
  update = updateService.bind(this)
  create = createService.bind(this)
  delete = deleteService.bind(this)
  showOne = showOneService.bind(this)
  changeStatus = changeStatusService.bind(this)
  filterRecipient = filterRecipientService.bind(this)
}
