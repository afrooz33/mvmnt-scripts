import { SettingName } from '@app/src/admin/region-settings/enums'

export default async function (settings: any) {
  const payload = []

  for (const name of Object.values(SettingName)) {
    if (!payload.find((setting) => setting.name === name)) {
      let value: string | boolean = Boolean(parseInt(settings[name]))

      if (name === SettingName.LANGUAGE) {
        value = settings[SettingName.LANGUAGE] ?? 'ja-JP'
      } else if (name === SettingName.TIMEZONE) {
        value = settings[SettingName.TIMEZONE] ?? 'asia/tokyo'
      } else if (name === SettingName.FIAT_CURRENCY) {
        value = settings[SettingName.FIAT_CURRENCY] ?? 'JPY'
      } else if (name === SettingName.STABLE_COIN) {
        value = settings[SettingName.STABLE_COIN] ?? 'JPYC'
      } else if (name === SettingName.COUNTRY) {
        value = settings[SettingName.COUNTRY] ?? 'Japan'
      }

      payload.push({
        name,
        value: {
          value,
        },
      })
    }
  }

  await this.entityManager.upsert('region_settings', payload, ['name'])
}
