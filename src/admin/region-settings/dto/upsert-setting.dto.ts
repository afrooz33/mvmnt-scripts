import { ApiProperty } from '@nestjs/swagger'
import { SettingName } from '@app/src/admin/region-settings/enums'
import { SettingValue } from '@app/src/admin/region-settings/interfaces'
import { IsDefined, IsEnum, IsNotEmpty } from 'class-validator'

export class UpsertSettingDto {
  @ApiProperty({
    description: 'Setting name',
    enum: Object.values(SettingName),
    default: SettingName.LANGUAGE,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsEnum(SettingName)
  readonly name: SettingName

  @ApiProperty({
    description: 'Setting value',
    type: 'jsonb',
    default: { value: 'ja-JP' },
  })
  @IsDefined()
  @IsNotEmpty()
  readonly value: SettingValue
}
