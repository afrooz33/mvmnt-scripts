import BigNumber from 'bignumber.js'
import { Repository } from 'typeorm'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { Injectable, NotFoundException } from '@nestjs/common'
import { ErrorKey } from '@app/src/shared/enums'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { BlockchainService } from '@app/src/blockchain/blockchain.service'
import { PaymentWalletsService } from '@app/src/users/payment-method/services'
import { RegisterRecurringDonationDirectDto } from '@app/src/recurring-donations/dto'
import { TokenWhitelistEntity } from '@app/src/admin/tokens/entities/whitelist-tokens.entity'
import { generatePaymentIds } from '@app/src/recurring-donations/helper/recurring-blockchain.helper'
import { DonationProjectEntity } from '@app/src/nonprofit/donation-projects/entities/donation-project.entity'
import { RecurringDonationSignaturesEntity } from '@app/src/recurring-donations/entities/recurring-donation-signatures.entity'
import { RecurringDonationSettingsEntity } from '@app/src/recurring-donations/entities/recurring-donation-settings.entity'

@Injectable()
export class RegisterRecurringDirectService {
  private DONATION_DAY_OF_MONTH: number

  constructor(
    @InjectRepository(UserEntity)
    protected readonly userRepository: Repository<UserEntity>,
    @InjectRepository(DonationProjectEntity)
    protected readonly donationProjectRepository: Repository<DonationProjectEntity>,
    @InjectRepository(TokenWhitelistEntity)
    protected readonly tokenRepository: Repository<TokenWhitelistEntity>,
    @InjectRepository(RecurringDonationSettingsEntity)
    protected readonly recurringDonationSettingsRepository: Repository<RecurringDonationSettingsEntity>,
    @InjectRepository(RecurringDonationSignaturesEntity)
    protected readonly recurringDonationSignaturesRepository: Repository<RecurringDonationSignaturesEntity>,
    private readonly configService: ConfigService,
    private readonly blockchainService: BlockchainService,
    private readonly paymentWalletsService: PaymentWalletsService,
  ) {
    this.DONATION_DAY_OF_MONTH = parseInt(this.configService.get('app.recurring.batchSize'))
  }

  registerDirect = async (userId: string, payload: RegisterRecurringDonationDirectDto) => {
    //  1: Get Donation Project Details
    const donationProject = await this.donationProjectRepository.findOne({
      where: {
        id: payload.donation_project,
      },
      select: ['id', 'vault_address'],
    })
    if (!donationProject) throw new NotFoundException(ErrorKey.DONATION_PROJECT_NOT_FOUND)

    //  2: Validate token is whitelisted
    const token = await this.tokenRepository.findOne({
      where: {
        address: payload.currency,
        is_whitelisted: true,
      },
    })
    if (!token) throw new NotFoundException(ErrorKey.INVALID_TOKEN)

    //  3: Get User's Wallet
    const userWallet = await this.paymentWalletsService.getUserWallet(
      userId,
      payload.payment_method,
    )
    if (!userWallet) throw new NotFoundException(ErrorKey.WALLET_NOT_FOUND)

    //  4: Create Payment Ids and calculate execution time
    const donationAmount = BigNumber(payload.amount)

    const { paymentIds, executionTime } = generatePaymentIds(this.DONATION_DAY_OF_MONTH)

    //  5. Generate Merkle Tree and Proof
    const { tree, donationEntries } = this.blockchainService.generateTreeAndData({
      totalMonths: 12,
      paymentIds: paymentIds,
      nonprofitVault: donationProject.vault_address,
      donor: userWallet.address,
      token: token.address,
      precision: token.decimals,
      amount: donationAmount,
      executionScheduledAfter: executionTime,
    })

    //  6: Generate signatures for recurring donation
    const signatures: RecurringDonationSignaturesEntity[] = []
    for (let i = 0; i < donationEntries.length; i += 1) {
      signatures.push(
        this.recurringDonationSignaturesRepository.create({
          id: paymentIds[i],
          unique_id: donationEntries[i].paymentId,
          usage_date: new Date(donationEntries[i].scheduledExecution * 1000),
          merkle_proof: donationEntries[i].proof,
        }),
      )
    }

    //  7: Save Recurring Donation in DB
    const recurringDonation = this.recurringDonationSettingsRepository.create({
      user: {
        id: userId,
      },
      donation_project: {
        id: donationProject.id,
      },
      donation_currency: token,
      payment_currency: token,
      donation_amount: donationAmount,
      donation_value: donationAmount.toNumber(),
      merkle_tree_root: this.blockchainService.getTreeRoot(tree),
      signatures: signatures,
      wallet: {
        id: userWallet.id,
      },
    })
    await recurringDonation.save()

    return {
      success: true,
      message: 'Recurring Donation Initiated',
      data: {
        root: this.blockchainService.getTreeRoot(tree),
        firstExecutionScheduled: donationEntries[0].scheduledExecution,
        donationEntries,
      },
    }
  }
}
