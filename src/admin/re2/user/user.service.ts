import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MyService } from '@app/src/shared/base'
import { MailService } from '@app/src/mail/mail.service'
import { IntegrationStatus } from '@app/src/re2/integrations/enums'
import { DonationsService } from '@app/src/donations/donations.service'
import { Re2UserEntity } from '@app/src/re2/user/entities/re2-user.entity'
import { FundraiserStatus, FundraiserType } from '@app/src/re2/fundraisers/enums'
import { FundraiserService } from '@app/src/admin/re2/fundraiser/fundraiser.service'
import { IntegrationService } from '@app/src/admin/re2/integration/integration.service'
import {
  showService,
  addMemoService,
  showOneService,
  reactivateService,
  deactivateService,
} from './services'

@Injectable()
export class Re2UserService extends MyService<Re2UserEntity> {
  constructor(
    @InjectRepository(Re2UserEntity)
    public readonly re2UserRepository: Repository<Re2UserEntity>,
    public readonly mailService: MailService,
    public readonly fundraiserService: FundraiserService,
    public readonly integrationService: IntegrationService,
    public readonly donationsService: DonationsService,
  ) {
    super(re2UserRepository, 'admin/re2/user')
  }

  show = showService.bind(this)
  addMemo = addMemoService.bind(this)
  showOne = showOneService.bind(this)
  reactivate = reactivateService.bind(this)
  deactivate = deactivateService.bind(this)

  /**
   * Deactivates all of the fundraisers belonging to a user.
   * Fundraisers of type 'form' are set to status 'suspended' if they are 'enabled'.
   * Fundraisers of type 'page' are set to status 'declined' if they are 'on_review',
   *   or 'suspended' if they are 'hidden', 'published', or 'confirmed'.
   * @param userId The id of the user whose fundraisers to deactivate.
   */
  async deactivateFundraisers(userId: string): Promise<void> {
    const fundraisers = await this.fundraiserService.fundraiserRepository.find({
      where: {
        user: {
          id: userId,
        },
      },
    })

    const updates = fundraisers.map((fundraiser) => {
      fundraiser.old_status = fundraiser.status

      if (
        fundraiser.type === FundraiserType.FORM &&
        fundraiser.status === FundraiserStatus.ENABLED
      ) {
        fundraiser.status = FundraiserStatus.SUSPENDED
      }

      if (fundraiser.type === FundraiserType.PAGE) {
        if (fundraiser.status === FundraiserStatus.ON_REVIEW) {
          fundraiser.status = FundraiserStatus.DECLINED
        } else if (
          [
            FundraiserStatus.HIDDEN,
            FundraiserStatus.PUBLISHED,
            FundraiserStatus.CONFIRMED,
          ].includes(fundraiser.status)
        ) {
          fundraiser.status = FundraiserStatus.SUSPENDED
        }
      }

      return fundraiser
    })

    await this.fundraiserService.updateOne(updates)
  }

  /**
   * Deactivate integrations for a user
   *
   * @param userId - The id of the user
   *
   * @returns A promise that resolves when the operation is complete
   */
  async deactivateIntegrations(userId: string): Promise<void> {
    const integrations = await this.integrationService.integrationRepository.find({
      where: {
        user: { id: userId },
        status: IntegrationStatus.ENABLED,
      },
    })

    const updates = integrations.map((integration) => {
      integration.old_status = integration.status
      integration.status = IntegrationStatus.SUSPENDED

      return integration
    })

    await this.integrationService.updateOne(updates)
  }

  async reactivateFundraisers(userId: string): Promise<void> {
    const now = new Date().getTime()

    const fundraisers = await this.fundraiserService.fundraiserRepository.find({
      where: {
        user: { id: userId },
      },
    })

    const updates = fundraisers.map((fundraiser) => {
      const start_date = new Date(fundraiser.start_date).getTime()
      const end_date = fundraiser.end_date ? new Date(fundraiser.end_date).getTime() : null

      if (fundraiser.status === FundraiserStatus.SUSPENDED) {
        if (fundraiser.type === FundraiserType.FORM) {
          fundraiser.status = FundraiserStatus.DISABLED
        } else if (fundraiser.type === FundraiserType.PAGE) {
          if (fundraiser.old_status === FundraiserStatus.CONFIRMED) {
            // Check if donation start date has passed
            if (start_date < now) {
              fundraiser.status = FundraiserStatus.PUBLISHED
            } else {
              fundraiser.status = FundraiserStatus.CONFIRMED
            }
          } else if (fundraiser.old_status === FundraiserStatus.PUBLISHED) {
            fundraiser.status = FundraiserStatus.PUBLISHED
          } else if (fundraiser.old_status === FundraiserStatus.HIDDEN) {
            fundraiser.status = FundraiserStatus.HIDDEN
          } else if (fundraiser.old_status === FundraiserStatus.SUSPENDED) {
            fundraiser.status = FundraiserStatus.DISABLED
          }

          // Check if donation end date has passed
          if (end_date && end_date < now) {
            fundraiser.status = FundraiserStatus.ENDED
          }
        }
      }

      fundraiser.old_status = null

      return fundraiser
    })

    await this.fundraiserService.updateOne(updates)
  }

  async reactivateIntegrations(userId: string): Promise<void> {
    const integrations = await this.integrationService.integrationRepository.find({
      where: {
        user: { id: userId },
        status: IntegrationStatus.SUSPENDED,
      },
    })

    const updates = integrations.map((integration) => {
      if (integration.old_status === IntegrationStatus.ENABLED) {
        integration.status = IntegrationStatus.DISABLED
      }

      integration.old_status = null

      return integration
    })

    await this.integrationService.updateOne(updates)
  }
}
