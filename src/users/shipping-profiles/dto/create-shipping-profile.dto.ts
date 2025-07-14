import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsArray,
  IsDefined,
  MaxLength,
  IsOptional,
  IsNotEmpty,
  ArrayMaxSize,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator'
import { ShippingZoneProperty } from './properties'

export class CreateShippingProfileDto {
  @ApiProperty({
    type: 'string',
    description: 'Name of the shipping profile',
    example: 'Standard Shipping',
  })
  @IsDefined()
  @IsNotEmpty()
  @MaxLength(100)
  readonly name: string

  @ApiPropertyOptional({
    type: [String],
    format: 'uuid',
    description: 'List of deals that the shipping profile is applicable to',
  })
  @IsArray()
  @IsOptional()
  deals?: string[]

  @ApiPropertyOptional({
    type: [String],
    format: 'uuid',
    description: 'List of variants that the shipping profile is applicable to',
  })
  @IsArray()
  @IsOptional()
  variants?: string[]

  @ApiProperty({
    description: 'List of shipping profile origins',
    type: [String],
    format: 'uuid',
    isArray: true,
    default: ['195af7fa-89b0-46d2-8d10-b395ddd71381'],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @IsNotEmpty({ each: true })
  readonly origins?: string[]

  @ApiProperty({
    description: 'List of shipping zones',
    isArray: true,
    type: () => ShippingZoneProperty,
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsNotEmpty({ each: true })
  @ValidateNested({ each: true })
  @Type(() => ShippingZoneProperty)
  readonly zones?: ShippingZoneProperty[]

  @IsOptional()
  all_deals?: boolean
}
