import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsEnum, IsNotEmpty, IsUUID } from 'class-validator'
import { IntegrationSettingType } from '@app/src/re2/integrations/enums'

export class DeleteSettingDto {
  @ApiProperty({
    description: 'Integration setting id',
    format: 'uuid',
    type: String,
  })
  @IsUUID()
  @IsDefined()
  @IsNotEmpty()
  readonly id: string

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
