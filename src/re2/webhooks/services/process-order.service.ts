import { Not } from 'typeorm'
import * as bcrypt from 'bcryptjs'
import BigNumber from 'bignumber.js'
import { BadRequestException } from '@nestjs/common'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { SuccessRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { ShopifyOrderDto } from '@app/src/re2/webhooks/dto'
import { DonationProjectStatus } from '@app/src/nonprofit/donation-projects/enums'
import { AccountStatus as NonprofitAccountStatus } from '@app/src/nonprofit/user/enums'
import { AccountStatus, UserAccountType, UserGender } from '@app/src/users/user/enums'

export default async function (payload: ShopifyOrderDto): Promise<SuccessRO> {
  try {
    if (payload.total_amount < 0) {
      throw new BadRequestException(ErrorKey.INVALID_TOTAL_AMOUNT)
    }

    const existingOrder = await this.shopifyOrderRepository.findOne({
      where: {
        order_id: payload.order_id,
        status: Not('CANCELLED'),
      },
    })

    if (payload.status === 'CANCELLED' && !existingOrder) {
      return {
        success: false,
        message: `Order [${payload.order_id}] not found`,
        data: payload,
      }
    }

    if (payload.status === 'CANCELLED' && existingOrder) {
      const today = new Date()
      const max_cancel_date = new Date(existingOrder.max_cancel_date)

      if (max_cancel_date.getTime() < today.getTime()) {
        // ToDo: Reverse points
      }

      existingOrder.status = payload.status

      await this.shopifyOrderRepository.save(existingOrder)

      return {
        success: true,
        message: `Order [${payload.order_id}] successfully cancelled`,
        data: payload,
      }
    }

    let user = await this.userService.findOne({
      where: {
        email: payload.email,
        account_status: Not(AccountStatus.DELETED),
      },
      select: ['id', 'rank', 'account_type'],
    })

    if (!user) {
      const hash = await bcrypt.genSalt(12)
      const username = `re2_${payload.email.replace(/[^a-z0-9]/gi, '_')}`

      user = await this.userService.updateOne(
        {
          email: payload.email,
          gender: UserGender.NA,
          display_name: `RE2 Temp User`,
          username,
          password: await bcrypt.hash(`Pas$w0rd_${username}`, hash),
          account_status: AccountStatus.DISABLED,
          account_type: UserAccountType.RE2_SHOPIFY_TEMP_USER,
        },
        null,
        true,
      )
    }

    let nonprofit
    let donation_project

    if (payload.donation_project) {
      const project = await this.donationProjectRepository.findOneOrFail({
        where: {
          id: payload.donation_project,
          status: DonationProjectStatus.PUBLISHED,
        },
        relations: [Query.USER],
        select: ['id', 'user'],
      })

      nonprofit = { id: project.user.id }
      donation_project = { id: project.id }
    }

    if (payload.nonprofit) {
      nonprofit = await this.nonprofitUserRepository.findOneOrFail({
        where: {
          id: payload.nonprofit,
          account_status: NonprofitAccountStatus.ACTIVE,
        },
        select: ['id'],
      })

      donation_project = await this.donationProjectRepository.findOne({
        where: {
          user: {
            id: nonprofit.id,
          },
          status: DonationProjectStatus.DEFAULT,
        },
        select: ['id'],
      })
    }

    const commonParams = {
      order_id: payload.order_id,
      user: {
        id: user.id,
      },
      nonprofit: {
        id: nonprofit?.id,
      },
      donation_project: {
        id: donation_project?.id,
      },
    }

    const today = new Date()
    const max_cancel_date = new Date(today.getFullYear(), today.getMonth() + 1, 1, 0, 0, 0)

    await this.shopifyOrderRepository.save({
      ...existingOrder,
      ...payload,
      ...commonParams,
      max_cancel_date,
    })

    //Allocate points
    await this.userPointsService.saveShopifyPoints(user, new BigNumber(payload.total_amount))

    //Allocate donation
    await this.userDonationsService.saveShopifyDonation(user, new BigNumber(payload.total_amount))

    return {
      success: true,
      message: `Order [${payload.order_id}] successfully processed`,
      data: payload,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
