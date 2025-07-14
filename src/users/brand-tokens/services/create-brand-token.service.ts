import { BadRequestException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { ErrorKey } from '@app/src/shared/enums'
import { BrandTokenRequestStatus } from '@app/src/brand-tokens/enums'
import { BrandTokenDetailsDto } from '@app/src/brand-tokens/dto'
import { WalletType, PaymentMethodStatus } from '@app/src/users/payment-method/enums'

export async function createBrandTokenService(
  userId: string,
  brandId: string,
  payload: BrandTokenDetailsDto,
): Promise<SuccessRO> {
  try {
    // Find the approved request for this brand
    const approvedRequest = await this.btRequestRepository.findOne({
      where: {
        user_id: userId,
        brand_id: brandId,
        status: BrandTokenRequestStatus.APPROVED,
      },
      relations: ['brand', 'user'],
      select: {
        id: true,
        brand: {
          id: true,
        },
        user: {
          id: true,
        },
      },
    })

    if (!approvedRequest) {
      throw new BadRequestException(ErrorKey.BRAND_TOKEN_REQUEST_NOT_APPROVED)
    }

    // Check if token already exists
    const existingToken = await this.brandTokenRepository.findOne({
      where: { brand: { id: brandId } },
    })

    if (existingToken) {
      throw new BadRequestException(ErrorKey.TOKEN_ALREADY_EXISTS)
    }

    // Validate user's wallet
    const wallet = await this.paymentWalletRepository.findOne({
      where: {
        user: { id: userId },
        type: WalletType.SMART_ACCOUNT,
        status: PaymentMethodStatus.ACTIVE,
        is_verified: true,
        is_default: true,
        is_internal: true,
      },
      select: {
        id: true,
        address: true,
        type: true,
        status: true,
        is_verified: true,
      },
    })

    if (!wallet) {
      throw new BadRequestException(ErrorKey.WALLET_NOT_FOUND)
    }

    // Create token on blockchain
    const tokenAddress = await this.createTokenOnBlockchain(approvedRequest, payload, wallet)

    // Create the brand token
    const brandToken = await this.brandTokenRepository.save({
      ...payload,
      contract_address: tokenAddress,
      is_deployed: true,
      total_supply: '2' + '0'.repeat(6),
      remaining_tokens: '2' + '0'.repeat(6),
      brand: { id: brandId },
      user: { id: userId },
    })

    // Update request status
    approvedRequest.status = BrandTokenRequestStatus.COMPLETED
    approvedRequest.brand_token_id = brandToken.id
    await this.btRequestRepository.save(approvedRequest)

    return {
      success: true,
      message: 'Brand token details saved successfully',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
