import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { SuccessRO } from '@app/src/shared/dto'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { PaymentWalletsService } from '@app/src/users/payment-method/services'
import { SmartContractService } from '@app/src/blockchain/smart-contract.service'
import { RecurringDonationSettingsEntity } from '@app/src/recurring-donations/entities/recurring-donation-settings.entity'

@Injectable()
export class CancelRecurringService {
  constructor(
    @InjectRepository(UserEntity)
    protected readonly userRepository: Repository<UserEntity>,
    @InjectRepository(RecurringDonationSettingsEntity)
    protected readonly recurringDonationSettingsRepository: Repository<RecurringDonationSettingsEntity>,
    private readonly smartContractService: SmartContractService,
    private readonly paymentWalletsService: PaymentWalletsService,
  ) {}

  async cancelUserRecurring(userId: string): Promise<SuccessRO> {
    //  1. Get user smart account
    const userSmartAccount = await this.paymentWalletsService.getUserSmartAccount(userId)

    //  2. Get all donations belonging to the User
    const donations = await this.recurringDonationSettingsRepository.find({
      where: {
        user: {
          id: userId,
        },
      },
      select: ['merkle_tree_root'],
    })

    //  3. Create data for donors and donationRoots
    const donors = []
    const donationRoots = []
    for (const donation of donations) {
      donors.push(userSmartAccount.address)
      donationRoots.push(donation.merkle_tree_root)
    }

    //  4. Call smart contract for cancelling recurring
    await this.smartContractService.cancelRecurringDonations(donors, donationRoots)

    return {
      success: true,
      message: 'Recurring donations cancelled for User',
      data: userId,
    }
  }
}
