import BigNumber from 'bignumber.js'
import { SuccessRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { UserEntity } from '@app/src/users/user/entities/user.entity'

export default async function (user: UserEntity, amount: BigNumber): Promise<SuccessRO> {
  try {
    // ToDo: save donation
    console.log('saveShopifyDonation', user, amount)
  } catch (error) {
    return HandleErrors(error)
  }
}
