import { CreateWalletDto } from '@app/src/shared/auth/dto'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey, UserTypes } from '@app/src/shared/enums'
import { BadRequestException } from '@nestjs/common'

async function createWalletAdmin(payload: CreateWalletDto, userId: string): Promise<SuccessRO> {
  //  1. Validate if Admin already has a wallet
  const hasDefaultWallet = await this.paymentWalletsService.hasDefaultWallet(
    userId,
    UserTypes.ADMIN,
  )
  if (hasDefaultWallet) {
    throw new BadRequestException(ErrorKey.WALLET_EXISTS)
  }

  //  2. Verify the idToken from Web3Auth
  const wallet_address = await this.web3Auth.validateWalletSignature(
    payload.message,
    payload.signature,
    payload.pub_key,
  )
  if (!wallet_address) {
    throw new BadRequestException(ErrorKey.INVALID_TOKEN)
  }

  //  3: Create Admin's default smart account and wallet
  await this.paymentWalletsService.addDefaultWallets(
    userId,
    UserTypes.ADMIN,
    wallet_address,
    payload.smart_account,
  )

  return {
    success: true,
    message: `Admin's Wallet and Smart Account address updated`,
  }
}

export default createWalletAdmin
