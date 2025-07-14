import { BadRequestException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { BanDto } from '@app/src/admin/deals/dto'
import { AccountStatus } from '@app/src/users/user/enums'
import { DealStatus, DealType } from '@app/src/users/deal/enums'

export default async function (payload: BanDto, id: string): Promise<SuccessRO> {
  try {
    const deal = await this.documentExists({
      condition: [
        {
          where: {
            id,
            status: DealStatus.UNLISTED,
            deal_type: DealType.RAFFLE,
          },
          relations: [Query.USER],
        },
      ],
      errorMessage: ErrorKey.DEAL_NOT_FOUND,
    })

    if (deal?.user?.account_status === AccountStatus.DELETED) {
      throw new BadRequestException(`User profile [${id}] not found`)
    }

    deal.status = DealStatus.DECLINED
    deal.admin_memo = payload.admin_memo ? payload.admin_memo : null

    await this.dealRepository.save(deal)

    return {
      success: true,
      message: `Deal [${id}] successfully declined`,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
