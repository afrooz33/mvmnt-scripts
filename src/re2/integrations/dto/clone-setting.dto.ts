import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsEnum, IsNotEmpty } from 'class-validator'
import { IntegrationSettingType } from '@app/src/re2/integrations/enums'

export class CloneSettingDto {
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
