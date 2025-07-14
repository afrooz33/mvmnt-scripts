import { SuccessRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { SettingName } from '@app/src/admin/region-settings/enums'
import { UpsertSettingDto } from '@app/src/admin/region-settings/dto'

export default async function (payload: [UpsertSettingDto]): Promise<SuccessRO> {
  try {
    for (const name of Object.values(SettingName)) {
      if (!payload.find((setting) => setting.name === name)) {
        let value: string | boolean = true

        if (name === SettingName.LANGUAGE) {
          value = 'ja-JP'
        } else if (name === SettingName.TIMEZONE) {
          value = 'Asia/Tokyo'
        } else if (name === SettingName.FIAT_CURRENCY) {
          value = 'JPY'
        } else if (name === SettingName.STABLE_COIN) {
          value = 'JPYC'
        }

        payload.push({
          name,
          value: {
            value,
          },
        })
      }
    }

    const settings = await this.regionSettingsRepository.upsert(payload, ['name'])

    return {
      success: true,
      data: settings.raw,
      message: 'Successfully updated or created settings',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
