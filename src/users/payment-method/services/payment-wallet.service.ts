import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MyService } from '@app/src/shared/base'
import { UserTypes } from '@app/src/shared/enums'
import { BlockchainService } from '@app/src/blockchain/blockchain.service'
import { PaymentMethodStatus, WalletType } from '@app/src/users/payment-method/enums'
import { PaymentWalletsEntity } from '@app/src/users/payment-method/entities/payment-wallets.entity'
import showWalletsService from './show-wallets.service'
import verifyWalletService from './verify-wallet.service'
import deleteWalletService from './delete-wallet.service'
import registerWalletService from './register-wallet.service'

@Injectable()
export class PaymentWalletsService extends MyService<PaymentWalletsEntity> {
  private userTypeColumn: Record<UserTypes, string> = {
    NONPROFIT: 'nonprofit',
    RE2: 're2',
    ADMIN: 'admin',
    BUSINESS_COMPANY: 'user',
    INDIVIDUAL_PERSONAL: 'user',
    INDIVIDUAL_INFLUENCER: 'user',
    RE2_SHOPIFY_TEMP_USER: 'user',
    BUSINESS_SOLE_PROPRIETOR: 'user',
  }

  constructor(
    @InjectRepository(PaymentWalletsEntity)
    private readonly paymentWalletRepository: Repository<PaymentWalletsEntity>,
    protected readonly blockchainService: BlockchainService,
  ) {
    super(paymentWalletRepository, 'user/payment_wallets')
  }

  async hasDefaultWallet(userId: string, userType: UserTypes): Promise<boolean> {
    const count = await this.paymentWalletRepository.count({
      where: {
        is_internal: true,
        status: PaymentMethodStatus.ACTIVE,
        [this.userTypeColumn[userType]]: { id: userId },
      },
    })
    return count > 0
  }

  async addDefaultWallets(userId: string, userType: UserTypes, eoa: string, smartAccount: string) {
    const accounts: PaymentWalletsEntity[] = []

    accounts.push(
      this.paymentWalletRepository.create({
        [this.userTypeColumn[userType]]: {
          id: userId,
        },
        address: eoa,
        is_verified: true,
        is_default: false,
        is_internal: true,
        type: WalletType.EOA,
        status: PaymentMethodStatus.ACTIVE,
      }),
    )

    accounts.push(
      this.paymentWalletRepository.create({
        [this.userTypeColumn[userType]]: {
          id: userId,
        },
        address: smartAccount,
        is_verified: true,
        is_default: true,
        is_internal: true,
        type: WalletType.SMART_ACCOUNT,
        status: PaymentMethodStatus.ACTIVE,
      }),
    )

    await this.paymentWalletRepository.save(accounts)
  }

  generateVerificationMsg = (id: string, userId: string, address: string, expiry: Date): string => {
    const data = {
      id,
      userId,
      address,
      expiry,
    }

    return JSON.stringify(data)
  }

  getExpiry = () => {
    const now = new Date()
    const fiveMinutes = 5 * 60 * 1000
    return new Date(now.getTime() + fiveMinutes)
  }

  async getUserWallet(userId: string, userWalletId: string): Promise<PaymentWalletsEntity> {
    const wallet = await this.paymentWalletRepository.findOne({
      where: {
        user: {
          id: userId,
        },
        id: userWalletId,
        status: PaymentMethodStatus.ACTIVE,
        is_verified: true,
      },
      select: {
        id: true,
        status: true,
        address: true,
        type: true,
        is_internal: true,
        is_default: true,
      },
    })

    return wallet
  }

  getUserDefaultWallet = async (userId: string): Promise<PaymentWalletsEntity> => {
    const wallet = await this.paymentWalletRepository.findOne({
      where: {
        user: {
          id: userId,
        },
        is_default: true,
      },
      select: {
        id: true,
        address: true,
        is_default: true,
      },
    })

    return wallet
  }

  async getBuyerSellerSmartAccount(buyerId: string, sellerId: string) {
    const findCondition = {
      is_default: true,
      is_internal: true,
      type: WalletType.SMART_ACCOUNT,
    }

    const buyerSmartAccount = await this.paymentWalletRepository.findOne({
      where: {
        user: { id: buyerId },
        ...findCondition,
      },
      select: ['id', 'address'],
    })

    const sellerSmartAccount = await this.paymentWalletRepository.findOne({
      where: {
        user: { id: sellerId },
        ...findCondition,
      },
      select: ['id', 'address'],
    })

    return {
      buyerSmartAccount,
      sellerSmartAccount,
    }
  }

  async getUserSmartAccount(userId: string) {
    const account = await this.paymentWalletRepository.findOne({
      where: {
        user: {
          id: userId,
        },
        is_default: true,
        is_internal: true,
        type: WalletType.SMART_ACCOUNT,
      },
      select: {
        id: true,
        address: true,
        is_default: true,
        is_internal: true,
        type: true,
        user: {
          id: true,
        },
      },
    })

    return account
  }

  async getNonprofitSmartAccount(nonprofitId: string) {
    const account = await this.paymentWalletRepository.findOne({
      where: {
        nonprofit: {
          id: nonprofitId,
        },
        is_default: true,
        is_internal: true,
        type: WalletType.SMART_ACCOUNT,
      },
      select: {
        id: true,
        address: true,
        is_default: true,
        is_internal: true,
        type: true,
        user: {
          id: true,
        },
      },
    })

    return account
  }

  /**
   * Binds the methods to the service instance
   */
  showWallets = showWalletsService.bind(this)
  verifyWallet = verifyWalletService.bind(this)
  deleteWallet = deleteWalletService.bind(this)
  registerWallet = registerWalletService.bind(this)
}
