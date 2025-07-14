import { In } from 'typeorm'
import { BadRequestException } from '@nestjs/common'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { GetAvailableDeliveryDates } from '@app/src/shared/helpers/Date.helper'
import { DealStatus } from '@app/src/users/deal/enums'
import { AccountStatus } from '@app/src/users/user/enums'
import { DeliverySettingsType } from '@app/src/users/delivery-settings/enums'
import { CalculateDeliveryDateDto } from '@app/src/users/delivery-settings/dto'

export default async function (query: CalculateDeliveryDateDto): Promise<unknown> {
  try {
    const variant = await this.dealVariantRepository.findOne({
      where: {
        id: query.variant,
        deal: {
          status: In([DealStatus.ON_DEAL]),
          user: {
            account_status: AccountStatus.ENABLED,
          },
        },
      },
      relations: [Query.PRODUCT_TAG, Query.DEAL, `${Query.DEAL}.${Query.USER}`],
      select: {
        id: true,
        product_tag: {
          id: true,
          is_disable_delivery_tag: true,
          date_range: true,
          days_range: true,
        },
        deal: {
          id: true,
          user: {
            id: true,
          },
        },
      },
    })

    if (!variant) {
      throw new BadRequestException(ErrorKey.INVALID_VARIANT)
    }

    const delivery_setting = await this.deliverySettingsRepository.findOne({
      where: {
        user: {
          id: variant.deal.user.id,
        },
        type: DeliverySettingsType.GENERAL,
        is_enabled: true,
      },
      relations: [Query.GENERAL_SETTINGS, `${Query.GENERAL_SETTINGS}.${Query.CARRIER}`],
    })

    if (!delivery_setting) {
      return {
        delivery_dates: null,
        delivery_carrier: null,
      }
    }

    let delivery_dates
    const today = new Date()
    const product_tag = variant?.product_tag

    if (!delivery_setting?.general_settings?.order_cut_off_time) {
      delivery_dates = null
    } else if (!product_tag) {
      delivery_dates = await GetAvailableDeliveryDates(
        delivery_setting.general_settings,
        today,
        query.timezone,
      )
    } else if (product_tag?.is_disable_delivery_tag) {
      const dates = await GetAvailableDeliveryDates(
        {
          ...delivery_setting.general_settings,
          delivery_days_range: delivery_setting.general_settings.delivery_days_range,
        },
        today,
        query.timezone,
      )

      delivery_dates = `${dates[0]} ~ ${dates[dates.length - 1]}`
    } else if (product_tag?.date_range) {
      delivery_dates = `${product_tag.date_range.earliest} ~ ${product_tag.date_range.latest}`
    } else if (product_tag?.days_range) {
      delivery_dates = await GetAvailableDeliveryDates(
        {
          ...delivery_setting.general_settings,
          delivery_days_range: product_tag.days_range,
        },
        today,
        query.timezone,
      )
    }

    return {
      delivery_dates,
      delivery_carrier: delivery_setting?.general_settings?.carrier,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
