import { Query } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { QueryDto } from '@app/src/users/delivery-settings/dto'
import { DeliverySettingStatus, DeliverySettingsType } from '@app/src/users/delivery-settings/enums'

export default async function (query: QueryDto, userId: string): Promise<any> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .addFilter('user', userId)
      .addFilter('type', query.type)
      .useQuery(this.deliverySettingsRepository)
      .create()

    if (query?.type === DeliverySettingsType.GENERAL) {
      results.condition.leftJoinAndSelect(`data.${Query.GENERAL_SETTINGS}`, Query.GENERAL_SETTINGS)
      results.condition.leftJoinAndSelect(
        `${Query.GENERAL_SETTINGS}.${Query.CARRIER}`,
        Query.CARRIER,
        `${Query.CARRIER}.status = :carrier_status`,
        {
          carrier_status: DeliverySettingStatus.ENABLED,
        },
      )
    }

    if (query?.type === DeliverySettingsType.UNATTENDED) {
      results.condition.leftJoinAndSelect(
        `data.${Query.UNATTENDED_SETTINGS}`,
        Query.UNATTENDED_SETTINGS,
      )
    }

    if (query?.type === DeliverySettingsType.PRODUCT_TAG) {
      results.condition.leftJoinAndSelect(
        `data.${Query.PRODUCT_TAG_SETTINGS}`,
        Query.PRODUCT_TAG_SETTINGS,
        `${Query.PRODUCT_TAG_SETTINGS}.status IN (:...status) AND ${Query.PRODUCT_TAG_SETTINGS}.is_disable_delivery_tag = :is_disable_delivery_tag`,
        {
          status: [DeliverySettingStatus.ENABLED],
          is_disable_delivery_tag: false,
        },
      )
    }

    if (query?.type === DeliverySettingsType.PREFERENCES_BY_DESTINATION) {
      results.condition.leftJoinAndSelect(
        `data.${Query.PREFERENCES_BY_DESTINATION}`,
        Query.PREFERENCES_BY_DESTINATION,
      )

      results.condition.leftJoinAndSelect(
        `${Query.PREFERENCES_BY_DESTINATION}.${Query.SHIPPING_ORIGIN}`,
        Query.SHIPPING_ORIGIN,
      )

      results.condition.leftJoinAndSelect(
        `${Query.PREFERENCES_BY_DESTINATION}.${Query.SHIPPING_PROFILES}`,
        Query.SHIPPING_PROFILE,
      )

      results.condition.leftJoinAndSelect(
        `${Query.PREFERENCES_BY_DESTINATION}.${Query.COUNTRIES}`,
        Query.COUNTRIES,
      )

      results.condition.leftJoinAndSelect(`${Query.COUNTRIES}.${Query.COUNTRY}`, Query.COUNTRY)

      results.condition.leftJoinAndSelect(
        `${Query.COUNTRIES}.${Query.DESTINATION_PROVINCES}`,
        Query.DESTINATION_PROVINCES,
      )

      results.condition.leftJoinAndSelect(
        `${Query.DESTINATION_PROVINCES}.${Query.PROVINCE}`,
        Query.PROVINCE,
      )
    }

    return await results.condition.getOne()
  } catch (error) {
    return HandleErrors(error)
  }
}
