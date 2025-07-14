import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsEnum, IsNotEmpty } from 'class-validator'
import { IntegrationSettingType, IntegrationPayloadStatus } from '@app/src/re2/integrations/enums'

export class ChangeStatusDto {
  @ApiProperty({
    description: 'Integration settings status',
    enum: Object.values(IntegrationPayloadStatus),
    example: IntegrationPayloadStatus.DISABLED,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsEnum(IntegrationPayloadStatus)
  readonly status: IntegrationPayloadStatus

  @ApiProperty({
    description: 'Integration settings type',
    enum: Object.values(IntegrationSettingType),
    example: IntegrationSettingType.CART_BANNER,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsEnum(IntegrationSettingType)
  readonly type: IntegrationSettingType
}
