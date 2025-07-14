import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IntegrationType } from '@app/src/re2/integrations/enums'
import { IsDefined, IsEnum, IsNotEmpty, ValidateIf } from 'class-validator'

export class CreateDto {
  @ApiProperty({
    type: 'enum',
    enum: Object.values(IntegrationType),
    example: IntegrationType.SHOPIFY,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsEnum(IntegrationType)
  readonly type: IntegrationType

  @ApiPropertyOptional({
    type: 'string',
    example: 'Shopify',
  })
  @IsDefined()
  @IsNotEmpty()
  @ValidateIf((o) => o.type === IntegrationType.SHOPIFY && o.shop != null)
  @IsNotEmpty({ message: 'Shop field must not be empty when type is SHOPIFY' })
  readonly shop: string
}
