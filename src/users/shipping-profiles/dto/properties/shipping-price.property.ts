import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsDefined, IsEnum, IsNotEmpty, IsOptional, ValidateIf } from 'class-validator'
import { PriceRange } from '@app/src/users/shipping-profiles/entities/methods'
import { ShippingPriceConditionType } from '@app/src/users/shipping-profiles/enums'

export class ShippingPriceProperty {
  @ApiProperty({
    type: 'string',
    description: 'Name of the shipping price',
    example: 'Standard Shipping',
  })
  @IsDefined()
  @IsNotEmpty()
  readonly name: string

  @ApiProperty({
    type: 'number',
    description: 'Price of the shipping price',
    example: 10,
  })
  @IsDefined()
  @IsNotEmpty()
  readonly price: number

  @ApiProperty({
    type: 'boolean',
    description: 'Whether the shipping price has a condition',
    example: true,
  })
  @IsDefined()
  @IsNotEmpty()
  readonly condition_enabled: boolean

  @ApiPropertyOptional({
    type: 'string',
    description: 'Type of the condition',
    example: ShippingPriceConditionType.WEIGHT,
  })
  @IsOptional()
  @IsEnum(ShippingPriceConditionType)
  @ValidateIf((o) => o.condition_enabled)
  readonly condition_type: ShippingPriceConditionType

  @ApiProperty({
    type: 'object',
    description: 'Range of the condition',
    example: { start: 0, end: 100 },
  })
  @IsDefined()
  @IsNotEmpty()
  readonly range: PriceRange
}
