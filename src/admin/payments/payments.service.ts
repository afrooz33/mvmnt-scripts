import { Injectable } from '@nestjs/common'
import { EntityManager, Repository } from 'typeorm'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { MyService } from '@app/src/shared/base'
import { UserDonationsEntity } from '@app/src/donations/entities/donations.entity'
import { NonprofitUserEntity } from '@app/src/nonprofit/user/entities/nonprofit-user.entity'
import {
  showService,
  toCsvService,
  showByService,
  topStatService,
  markPaidService,
  donorListService,
  donationListService,
  donationGraphService,
  toCsvDonorListService,
} from './services'

@Injectable()
export class PaymentsService extends MyService<UserDonationsEntity> {
  constructor(
    @InjectRepository(UserDonationsEntity)
    private readonly donationsRepository: Repository<UserDonationsEntity>,
    @InjectRepository(NonprofitUserEntity)
    private nonprofitUserRepository: Repository<NonprofitUserEntity>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {
    super(donationsRepository, 'admin/payments')
  }

  private toCSV = toCsvService.bind(this)
  private toCSVDonorList = toCsvDonorListService.bind(this)

  show = showService.bind(this)
  showBy = showByService.bind(this)
  topStat = topStatService.bind(this)
  markPaid = markPaidService.bind(this)
  donorList = donorListService.bind(this)
  donationList = donationListService.bind(this)
  donationGraph = donationGraphService.bind(this)
}
