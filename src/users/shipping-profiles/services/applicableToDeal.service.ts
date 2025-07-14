import { In, Not } from 'typeorm'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { shippingProfileQuery } from '@app/src/shared/sql'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { DealStatus } from '@app/src/users/deal/enums'

/**
 * @description - Get information about applicable shipping profiles for a deal and variant
 *
 * @param userId seller id
 * @param dealId deal id
 * @param variantId variant id
 * @param returnType return type which indicates what to return
 * @returns Promise
 */
export default async function (
  userId: string,
  dealId: string,
  variantId: string,
  returnType: 'origins' | 'price' | 'zones' | 'shipping_profile',
): Promise<SuccessRO> {
  try {
    let message = ''
    let result = []

    // Verify if the deal exists and belongs to the user
    if (dealId) {
      await this.dealService.documentExists({
        condition: [
          {
            where: {
              id: dealId,
              status: Not(DealStatus.DELETED),
            },
            select: ['id'],
          },
        ],
        errorMessage: ErrorKey.DEAL_NOT_FOUND,
      })
    }

    // Verify if the variant exists and belongs to the user
    if (variantId) {
      await this.dealVariantRepository.findOneOrFail({
        where: {
          id: variantId,
          deal: {
            status: Not(DealStatus.DELETED),
          },
        },
        select: ['id'],
      })
    }

    // Step 1: Check for Variant-Specific Rule
    if (variantId) {
      const sql = shippingProfileQuery.getVariantSpecificOrigins()
      message = 'Shipping profile for the variant is applicable'
      result = await this.shippingProfileRepository.query(sql, [variantId, userId])
    }

    // Step 2: Check for Deal-Specific Rule
    if (dealId && !result.length) {
      const sql = shippingProfileQuery.getDealSpecificOrigins()
      message = 'Shipping profile for the deal is applicable'
      result = await this.shippingProfileRepository.query(sql, [dealId, userId])
    }

    // Step 3: Check for All Deals Rule
    if (!result.length) {
      const sql = shippingProfileQuery.getAllDealsOrigins()
      message = 'Shipping profile for all deals is applicable'
      result = await this.shippingProfileRepository.query(sql, [userId])
    }

    // Step 4: Get Default Shipping Profile
    if (!result.length) {
      const defaultSql = shippingProfileQuery.getDefaultOrigins()
      message = 'Shipping profile for default is applicable'
      result = await this.shippingProfileRepository.query(defaultSql, [userId])
    }

    // Step 5: Get Shipping Profile Prices
    if (returnType === 'price' && result.length > 0) {
      const shippingProfileIds = result.map((row: any) => row.shippingProfilesId)

      message = 'Shipping profile applicable prices'
      result = await this.shippingPriceRepository.find({
        where: {
          zone: {
            shipping_profile: In(shippingProfileIds),
          },
        },
      })
    }

    //if return type is shipping profile, then return shipping profile ids
    if (returnType === 'shipping_profile' && result.length > 0) {
      message = 'Shipping profiles'
      result = result.map((row: any) => row.shippingProfilesId)
    }

    return {
      success: true,
      data: result,
      message,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
