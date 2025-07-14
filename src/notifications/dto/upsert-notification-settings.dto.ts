import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsDefined, IsEnum, IsNotEmpty } from 'class-validator'
import { NotificationSettingType } from '@app/src/notifications/enums'

export class UpsertNotificationSettingsDto {
  @ApiProperty({
    type: Boolean,
    description: 'Status of the notification setting',
    example: true,
    default: true,
  })
  @IsNotEmpty()
  @IsDefined()
  @IsBoolean()
  status: boolean

  @ApiProperty({
    type: 'enum',
    description: 'Type of the notification setting',
    enum: Object.values(NotificationSettingType),
  })
  @IsNotEmpty()
  @IsDefined()
  @IsEnum(NotificationSettingType)
  type: NotificationSettingType
}
