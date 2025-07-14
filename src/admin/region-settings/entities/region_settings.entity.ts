import { Column, Entity, Unique } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { SettingName } from '@app/src/admin/region-settings/enums'
import { SettingValue } from '@app/src/admin/region-settings/interfaces'

@Entity('region_settings')
@Unique('unique_region_settings', ['name'])
export class RegionSettingsEntity extends MyEntity {
  @Column({
    type: 'enum',
    enum: Object.values(SettingName),
    default: SettingName.LANGUAGE,
  })
  name: SettingName

  @Column({ type: 'jsonb' })
  value: SettingValue
}
