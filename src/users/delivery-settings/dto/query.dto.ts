import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { DeliverySettingsType } from '@app/src/users/delivery-settings/enums'

export class QueryDto {
  @ApiProperty({
    description: 'Setting type',
    enum: Object.values(DeliverySettingsType),
    default: DeliverySettingsType.GENERAL,
  })
  @IsEnum(DeliverySettingsType)
  @IsNotEmpty()
  readonly type: DeliverySettingsType

  @ApiPropertyOptional({
    description: 'Page',
    default: 1,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly page?: string

  @ApiPropertyOptional({
    description: 'Results per page',
    default: 10,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly limit?: string
}
