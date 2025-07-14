import { Queue } from 'bullmq'
import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bullmq'
import { InjectRepository } from '@nestjs/typeorm'
import { MyService } from '@app/src/shared/base'
import { BullMqQuery } from '@app/src/shared/constant'
import { MailService } from '@app/src/mail/mail.service'
import { ImagesService } from '@app/src/images/images.service'
import { DealService } from '@app/src/users/deal/deal.service'
import { TagsService } from '@app/src/admin/tags/tags.service'
import { DonationProjectEntity } from './entities/donation-project.entity'
import { UserDonationsEntity } from '@app/src/donations/entities/donations.entity'
import { NotificationsService } from '@app/src/notifications/notifications.service'
import { TaskSchedulerService } from '@app/src/task-scheduler/task-scheduler.service'
import { NonprofitProfileService } from '@app/src/nonprofit/profile/nonprofit-profile.service'
import {
  showService,
  createService,
  updateService,
  deleteService,
  donorListService,
  updateVaultService,
  donationSourceListService,
  getDonationProjectsService,
  showDonationSourceService,
  donationSourceDonorService,
  toCSVDonationProjectService,
  toCSVDonationSourceDonorService,
} from './services'

@Injectable()
export class DonationProjectsService extends MyService<DonationProjectEntity> {
  constructor(
    @InjectRepository(DonationProjectEntity)
    public donationProjectRepository: Repository<DonationProjectEntity>,
    @InjectRepository(UserDonationsEntity)
    public donationRepository: Repository<UserDonationsEntity>,
    @InjectQueue(BullMqQuery.DONATION_PROJECT_QUEUE)
    private readonly donationProjectQueue: Queue,
    private readonly imagesService: ImagesService,
    private readonly tagsService: TagsService,
    private readonly nonprofitProfileService: NonprofitProfileService,
    private readonly mailerService: MailService,
    private readonly dealService: DealService,
    private readonly taskSchedulerService: TaskSchedulerService,
    private readonly notificationsService: NotificationsService,
  ) {
    super(donationProjectRepository, 'nonprofit/donation-projects')
  }

  private toCSVDonationProject = toCSVDonationProjectService.bind(this)
  private toCSVDonationSourceDonor = toCSVDonationSourceDonorService.bind(this)

  show = showService.bind(this)
  create = createService.bind(this)
  update = updateService.bind(this)
  delete = deleteService.bind(this)
  donorList = donorListService.bind(this)
  updateVault = updateVaultService.bind(this)
  showDonationSource = showDonationSourceService.bind(this)
  donationSourceList = donationSourceListService.bind(this)
  getDonationProjects = getDonationProjectsService.bind(this)
  donationSourceDonor = donationSourceDonorService.bind(this)
}
