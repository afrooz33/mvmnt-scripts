import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsDefined, IsEnum } from 'class-validator'
import { DeliverySettingsType } from '@app/src/users/delivery-settings/enums/delivery-settings-type.enum'

export class ChangeDeliverySettingStatusDto {
  @ApiProperty({
    description: 'Delivery setting type',
    enum: Object.values(DeliverySettingsType),
    default: DeliverySettingsType.GENERAL,
  })
  @IsDefined()
  @IsEnum(DeliverySettingsType)
  readonly type: DeliverySettingsType

  @ApiProperty({
    description: 'Delivery setting status',
    default: true,
    type: Boolean,
  })
  @IsDefined()
  @IsBoolean()
  readonly status: boolean
}
