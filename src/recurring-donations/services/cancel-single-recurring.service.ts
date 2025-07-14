import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { RecurringDonationSettingsEntity } from '@app/src/recurring-donations/entities/recurring-donation-settings.entity'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import {
  CancelSingleRecurringDonationDto,
  ConfirmCancelRecurringDonationDto,
} from '@app/src/recurring-donations/dto'
import { WalletType } from '@app/src/users/payment-method/enums'
import { PaymentWalletsEntity } from '@app/src/users/payment-method/entities/payment-wallets.entity'
import { uuidFromUniqueId } from '@app/src/users/payment/methods/uuid.methods'
import { SmartContractService } from '@app/src/blockchain/smart-contract.service'

@Injectable()
export class CancelSingleRecurringService {
  constructor(
    @InjectRepository(UserEntity)
    protected readonly userRepository: Repository<UserEntity>,
    @InjectRepository(RecurringDonationSettingsEntity)
    protected readonly recurringDonationSettingsRepository: Repository<RecurringDonationSettingsEntity>,
    private readonly smartContractService: SmartContractService,
  ) {}

  async cancelSingleRecurring(
    userId: string,
    payload: CancelSingleRecurringDonationDto,
  ): Promise<SuccessRO> {
    //  1. Get Recurring donation details
    const recurringDonation = await this.recurringDonationSettingsRepository.findOne({
      where: {
        user: {
          id: userId,
        },
        id: payload.recurring_donation,
        is_active: true,
      },
      relations: [Query.USER],
      select: {
        id: true,
        is_active: true,
        user: {
          id: true,
          wallets: true,
        },
        merkle_tree_root: true,
      },
    })
    if (!recurringDonation) throw new NotFoundException(ErrorKey.RECURRING_DONATION_NOT_FOUND)

    const userSmartAccount = this.findSmartAccount(recurringDonation.user.wallets)

    return {
      success: true,
      message: 'Recurring donation cancellation for User',
      data: {
        donors: [userSmartAccount.address],
        donationRoots: [recurringDonation.merkle_tree_root],
      },
    }
  }

  async confirmCancelRecurring(payload: ConfirmCancelRecurringDonationDto) {
    //  1: Get recurring donation with signatures
    const recurringDonation = await this.recurringDonationSettingsRepository.findOne({
      where: {
        id: uuidFromUniqueId(payload.id),
        is_active: true,
      },
      relations: {
        signatures: true,
      },
    })
    if (!recurringDonation) {
      throw new NotFoundException(ErrorKey.RECURRING_DONATION_INACTIVE)
    }

    //  2: Mark recurring settings as inactive
    recurringDonation.is_active = false

    //  3: Update recurring signatures as is_deleted where is_consumed is false
    for (let i = 0; i < recurringDonation.signatures.length; i += 1) {
      if (recurringDonation.signatures[i].is_consumed == false) {
        recurringDonation.signatures[i].is_deleted = true
      }
    }

    //  4: Save the changes to Recurring Donation
    await recurringDonation.save()
  }

  findSmartAccount = (wallets: PaymentWalletsEntity[]): PaymentWalletsEntity | undefined => {
    return wallets.find(
      (wallet) => wallet.is_internal === true && wallet.type === WalletType.SMART_ACCOUNT,
    )
  }

  async processUserOrResourceDeactivation(donors: string[], donationRoots: string[]) {
    await this.smartContractService.cancelRecurringDonations(donors, donationRoots)
  }
}
