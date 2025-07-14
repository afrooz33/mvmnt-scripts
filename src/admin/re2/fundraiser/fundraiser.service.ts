import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MyService } from '@app/src/shared/base'
import { MailService } from '@app/src/mail/mail.service'
import { DonationsService } from '@app/src/donations/donations.service'
import { UserDonationsEntity } from '@app/src/donations/entities/donations.entity'
import { FundraiserEntity } from '@app/src/re2/fundraisers/entities/fundraisers.entity'
import {
  showService,
  updateFormStatus,
  suspendPageService,
  reactivatePageService,
  listContributorsService,
  showDonationSourceService,
} from './services'

@Injectable()
export class FundraiserService extends MyService<FundraiserEntity> {
  constructor(
    @InjectRepository(FundraiserEntity)
    public readonly fundraiserRepository: Repository<FundraiserEntity>,
    @InjectRepository(UserDonationsEntity)
    public readonly userDonationsRepository: Repository<UserDonationsEntity>,
    public readonly mailService: MailService,
    public readonly donationService: DonationsService,
  ) {
    super(fundraiserRepository, 'admin/re2/fundraiser')
  }

  show = showService.bind(this)
  suspendForm = updateFormStatus.bind(this)
  suspendPage = suspendPageService.bind(this)
  reactivateForm = updateFormStatus.bind(this)
  reactivatePage = reactivatePageService.bind(this)
  listContributors = listContributorsService.bind(this)
  showDonationSource = showDonationSourceService.bind(this)
}
