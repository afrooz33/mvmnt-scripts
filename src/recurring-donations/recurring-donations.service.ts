import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { SuccessRO } from '@app/src/shared/dto'
import { RecurringDonationSettingsEntity } from '@app/src/recurring-donations/entities/recurring-donation-settings.entity'
import {
  CancelRecurringService,
  ExecuteRecurringService,
  RegisterRecurringDealService,
  CancelSingleRecurringService,
  RegisterRecurringDirectService,
} from './services'

@Injectable()
export class RecurringDonationsService {
  constructor(
    @InjectRepository(RecurringDonationSettingsEntity)
    private readonly recurringDonationSettingsRepository: Repository<RecurringDonationSettingsEntity>,
    private readonly cancelRecurringService: CancelRecurringService,
    private readonly executeRecurringService: ExecuteRecurringService,
    private readonly registerRecurringDealService: RegisterRecurringDealService,
    private readonly cancelSingleRecurringService: CancelSingleRecurringService,
    private readonly registerRecurringDirectService: RegisterRecurringDirectService,
  ) {}

  registerDeal = this.registerRecurringDealService.registerDeal
  registerDirect = this.registerRecurringDirectService.registerDirect
  cancelUserRecurring = this.cancelRecurringService.cancelUserRecurring
  cancelSingleRecurring = this.cancelSingleRecurringService.cancelSingleRecurring
  confirmCancelRecurring = this.cancelSingleRecurringService.confirmCancelRecurring
  executeRecurringDonation = this.executeRecurringService.executeRecurringDonation
  processUserOrResourceDeactivation =
    this.cancelSingleRecurringService.processUserOrResourceDeactivation

  async getAllDonations(userId: string): Promise<SuccessRO> {
    const donations = await this.recurringDonationSettingsRepository.find({
      where: {
        user: {
          id: userId,
        },
      },
    })

    return {
      success: true,
      message: 'User recurring donations',
      data: donations,
    }
  }
}
