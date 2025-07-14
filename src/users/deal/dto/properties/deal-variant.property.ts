import {
  IsEnum,
  IsUUID,
  IsArray,
  IsDefined,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  ArrayMinSize,
  ArrayMaxSize,
  ValidateIf,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { UploadType } from '@app/src/shared/enums'
import {
  IsImageAvailable,
  IsLowerThanOriginalPrice,
  IsValidDealOptionColorValue,
} from '@app/src/shared/decorators'
import { ReturnEligibility } from '@app/src/users/deal/enums'
import { DealVariantOption } from './deal-variant-option.property'
import { SetInventoryProperty } from './set-inventory.property'

export class DealVariant {
  @ApiProperty({
    type: 'number',
    format: 'decimal',
    example: '1000.00',
  })
  @IsDefined()
  @IsNumber()
  @IsNotEmpty()
  @IsLowerThanOriginalPrice({
    message:
      'Price must be lower than the original price if original price is defined and greater than 0',
  })
  readonly price: number

  @ApiPropertyOptional({
    description: 'Original price',
    type: 'number',
    format: 'decimal',
    example: '1000.00',
  })
  @IsNumber()
  @IsOptional()
  readonly original_price?: number

  @ApiProperty({
    type: [SetInventoryProperty],
  })
  @IsArray()
  @IsDefined()
  @ArrayMinSize(1)
  @IsNotEmpty({ each: true })
  @ValidateIf((o) => o.is_one_of_kind === false)
  inventory: SetInventoryProperty[]

  @ApiProperty({
    type: [String],
    format: 'uuid',
    example: ['15d70949-793c-468a-8cfd-0f01325b25cc'],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @IsImageAvailable(
    {
      message: 'Invalid image',
    },
    UploadType.DEAL,
  )
  readonly images: string[]

  @ApiProperty({
    type: [DealVariantOption],
  })
  @IsArray()
  @IsOptional()
  @IsValidDealOptionColorValue()
  readonly option_values: DealVariantOption[]

  @ApiPropertyOptional({
    description: 'Delivery product tag',
    format: 'uuid',
    example: '95021f96-a6b7-49aa-ace8-89f2dfdc166a',
  })
  @IsUUID()
  @IsOptional()
  readonly product_tag?: string

  @ApiProperty({
    type: 'enum',
    enum: Object.values(ReturnEligibility),
    default: ReturnEligibility.MAKE_RETURNABLE,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsEnum(ReturnEligibility)
  readonly return_eligibility: ReturnEligibility
}
