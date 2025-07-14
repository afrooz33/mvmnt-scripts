import { In } from 'typeorm'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey, Query } from '@app/shared/enums'
import { AccountType } from '@app/src/shared/auth/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { ShopInfoDto } from '@app/src/users/user/dto'
import { UserEntity } from '@app/src/users/user/entities/user.entity'

export default async function (payload: ShopInfoDto, userId?: string): Promise<SuccessRO> {
  const user: UserEntity = await this.documentExists({
    condition: [
      {
        where: {
          id: userId,
          account_type: In([
            AccountType.BUSINESS_COMPANY,
            AccountType.INDIVIDUAL_PERSONAL,
            AccountType.INDIVIDUAL_INFLUENCER,
            AccountType.BUSINESS_SOLE_PROPRIETOR,
          ]),
        },
        relations: [Query.SHOP_INFO],
      },
    ],
    message: ErrorKey.USER_NOT_FOUND,
  })

  try {
    await this.updateOne(
      {
        ...user,
        shop_info: {
          ...user.shop_info,
          ...payload,
        },
      },
      null,
      null,
    )

    return {
      data: payload,
      message: 'Shop information saved successfully.',
      success: true,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
