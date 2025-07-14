import { v4 as uuid } from 'uuid'
import { BadRequestException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { RegisterWalletDto } from '@app/src/users/payment-method/dto'
import { PaymentMethodStatus, WalletType } from '@app/src/users/payment-method/enums'

export default async function (userId: string, payload: RegisterWalletDto): Promise<SuccessRO> {
  try {
    // check if user deleted wallet then reenable it
    const deletedWallet = await this.paymentWalletRepository.findOne({
      where: {
        address: payload.address,
        user: { id: userId },
        status: PaymentMethodStatus.DELETED,
      },
      select: {
        id: true,
        address: true,
        status: true,
      },
    })

    if (deletedWallet) {
      deletedWallet.status = PaymentMethodStatus.ACTIVE
      await deletedWallet.save()

      return {
        success: true,
        message: 'Wallet registration successful',
        data: {
          id: deletedWallet.id,
        },
      }
    }

    //  1: Check if the wallet address is already registered
    let existingWallet = await this.paymentWalletRepository.findOne({
      where: {
        address: payload.address,
      },
      relations: {
        user: true,
      },
      select: {
        id: true,
        address: true,
        is_verified: true,
        verification_expiry: true,
        user: {
          id: true,
        },
      },
    })

    if (existingWallet && existingWallet?.user?.id !== userId) {
      throw new BadRequestException(ErrorKey.WALLET_EXISTS_ANOTHER_USER)
    }

    //  2: If wallet doesn't exist, create a wallet
    if (!existingWallet) {
      existingWallet = this.paymentWalletRepository.create({
        user: {
          id: userId,
        },
        address: payload.address,
        verification_expiry: this.getExpiry(),
        status: PaymentMethodStatus.ACTIVE,
        is_internal: false,
        is_default: false,
        is_verified: false,
        type: WalletType.EOA,
      })

      await existingWallet.save()
    }

    //  3: Check for existing wallet and verification status
    if (existingWallet.is_verified) {
      throw new BadRequestException(ErrorKey.WALLET_EXISTS)
    }

    //  4: Update expiry and unique ID if required
    if (existingWallet.verification_expiry < new Date()) {
      const oldId = existingWallet.id

      existingWallet.id = uuid()
      existingWallet.verification_expiry = this.getExpiry()
      //  4.1: Update the ID
      await existingWallet.save()

      //  4.2: Delete the old entry
      await this.paymentWalletRepository.delete({
        id: oldId,
      })
    }

    //  5: Create Message for User to sign
    const msg = this.generateVerificationMsg(
      existingWallet.id,
      userId,
      payload.address,
      existingWallet.verification_expiry,
    )

    return {
      success: true,
      message: 'Wallet registration successful',
      data: msg,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
