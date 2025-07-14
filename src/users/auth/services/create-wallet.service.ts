import { CreateWalletDto } from '@app/src/shared/auth/dto'
import { ErrorKey, UserTypes } from '@app/src/shared/enums'
import { BadRequestException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'

async function createWalletUser(payload: CreateWalletDto, userId: string): Promise<SuccessRO> {
  // ToDo: Get user types from the controller
  const userType: UserTypes = UserTypes.INDIVIDUAL_PERSONAL

  //  1: Validate if user already has default wallet
  const hasDefaultWallet = await this.paymentWalletsService.hasDefaultWallet(userId, userType)
  if (hasDefaultWallet) {
    throw new BadRequestException(ErrorKey.WALLET_EXISTS)
  }

  //  2: Verify the idToken from Web3Auth
  const wallet_address = await this.web3Auth.validateWalletSignature(
    payload.message,
    payload.signature,
    payload.pub_key,
  )
  if (!wallet_address) {
    throw new BadRequestException(ErrorKey.INVALID_TOKEN)
  }

  //  3: Create user's default smart account and wallet
  await this.paymentWalletsService.addDefaultWallets(
    userId,
    userType,
    wallet_address,
    payload.smart_account,
  )

  return {
    success: true,
    message: `User's Wallet and Smart Account address updated`,
  }
}

export default createWalletUser
