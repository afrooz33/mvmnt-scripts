import { BadRequestException, NotFoundException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { VerifyWalletDto } from '@app/src/users/payment-method/dto'

export default async function (userId: string, payload: VerifyWalletDto): Promise<SuccessRO> {
  try {
    //  1: Get details of the existing wallet
    const existingWallet = await this.paymentWalletRepository.findOne({
      where: {
        user: {
          id: userId,
        },
        address: payload.address,
        is_verified: false,
        is_internal: false,
        is_default: false,
      },
      relations: {
        user: true,
      },
      select: {
        id: true,
        user: {
          id: true,
        },
        address: true,
        is_verified: true,
        is_internal: true,
        is_default: true,
        verification_expiry: true,
      },
    })
    if (!existingWallet) throw new NotFoundException(ErrorKey.WALLET_NOT_FOUND)

    //  2: Validate Expiry
    if (existingWallet.verification_expiry < new Date())
      throw new BadRequestException(ErrorKey.WALLET_VERIFICATION_EXPIRED)

    //  3: Verify the signature
    try {
      const message = this.generateVerificationMsg(
        existingWallet.id,
        existingWallet.user.id,
        existingWallet.address,
        existingWallet.verification_expiry,
      )
      const isVerified = this.blockchainService.isWalletSignatureValid(
        payload.signature,
        payload.address,
        message,
      )

      if (!isVerified) {
        throw new BadRequestException(ErrorKey.INVALID_SIGNATURE)
      }
    } catch (err) {
      throw new BadRequestException(err.message)
    }

    //  4: Mark the wallet as verified
    existingWallet.is_verified = true
    await existingWallet.save()

    return {
      success: true,
      message: 'Wallet Added',
      data: existingWallet,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
