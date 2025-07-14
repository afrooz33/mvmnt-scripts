import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { MyService } from '@app/src/shared/base'
import { FundraiserService } from '@app/src/re2/fundraisers/fundraisers.service'
import { UserDonationsEntity } from '@app/src/donations/entities/donations.entity'
import { IntegrationsService } from '@app/src/re2/integrations/integrations.service'
import { FundraiserEntity } from '@app/src/re2/fundraisers/entities/fundraisers.entity'
import { NonprofitUserEntity } from '@app/src/nonprofit/user/entities/nonprofit-user.entity'
import { ShopifyIntegrationsEntity } from '@app/src/re2/integrations/entities/shopify-integration.entity'
import { DonationProjectEntity } from '@app/src/nonprofit/donation-projects/entities/donation-project.entity'
import {
  topSummaryService,
  listFundraisersService,
  listIntegrationsService,
  summaryDonationsService,
  listContributorsService,
  summaryTotalDonationsService,
  summaryDonationSourcesService,
  summaryDonatedNonprofitsService,
  listFundraiserContributorsService,
  listIntegrationContributorsService,
  summaryDonatedDonationProjectsService,
} from './services'

@Injectable()
export class AnalyticsService extends MyService<NonprofitUserEntity> {
  constructor(
    private readonly fundraisersService: FundraiserService,
    private readonly integrationsService: IntegrationsService,
    private readonly entityManager: EntityManager,
    @InjectRepository(FundraiserEntity)
    private readonly fundraiserRepository: Repository<FundraiserEntity>,
    @InjectRepository(ShopifyIntegrationsEntity)
    private readonly shopifyIntegrationRepository: Repository<ShopifyIntegrationsEntity>,
    @InjectRepository(UserDonationsEntity)
    private readonly userDonationsRepository: Repository<UserDonationsEntity>,
    @InjectRepository(NonprofitUserEntity)
    private readonly nonprofitUserRepository: Repository<NonprofitUserEntity>,
    @InjectRepository(DonationProjectEntity)
    private readonly donationProjectRepository: Repository<DonationProjectEntity>,
  ) {
    super(nonprofitUserRepository, '')
  }

  topSummary = topSummaryService.bind(this)
  listFundraisers = listFundraisersService.bind(this)
  listIntegrations = listIntegrationsService.bind(this)
  summaryDonations = summaryDonationsService.bind(this)
  listContributors = listContributorsService.bind(this)
  summaryTotalDonations = summaryTotalDonationsService.bind(this)
  summaryDonationSources = summaryDonationSourcesService.bind(this)
  summaryDonatedNonprofits = summaryDonatedNonprofitsService.bind(this)
  listFundraiserContributors = listFundraiserContributorsService.bind(this)
  listIntegrationContributors = listIntegrationContributorsService.bind(this)
  summaryDonatedDonationProjects = summaryDonatedDonationProjectsService.bind(this)
}
