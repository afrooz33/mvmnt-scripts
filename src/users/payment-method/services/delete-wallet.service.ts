import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { PaymentMethodStatus } from '@app/src/users/payment-method/enums'

export default async function (userId: string, walletId: string): Promise<SuccessRO> {
  try {
    const wallet = await this.documentExists({
      condition: [
        {
          where: {
            id: walletId,
            status: PaymentMethodStatus.ACTIVE,
            user: {
              id: userId,
            },
          },
          select: {
            id: true,
            status: true,
          },
        },
      ],
      errorMessage: ErrorKey.WALLET_NOT_FOUND,
    })

    wallet.status = PaymentMethodStatus.DELETED

    await this.paymentWalletRepository.save(wallet)

    return {
      success: true,
      message: 'Wallet deleted successfully',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
