import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsUUID,
  IsDefined,
  IsNotEmpty,
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  ValidateNested,
  IsOptional,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ShippingZoneProperty } from './shipping-zone.property'
import { UpdateCountryProperty } from './update-country.property'
import { UpdateShippingPriceProperty } from './update-shipping-price.property'

export class UpdateShippingZoneProperty extends ShippingZoneProperty {
  @ApiPropertyOptional({
    required: false,
    description: 'Shipping zone id',
    format: 'uuid',
    example: '9a481d6f-dcd1-4c73-938e-af5ddac1ee30',
  })
  @IsUUID()
  @IsOptional()
  readonly id?: string

  @ApiProperty({
    type: [UpdateCountryProperty],
    description: 'List of countries that the shipping zone is applicable to',
  })
  @IsArray()
  @IsDefined()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @IsNotEmpty({ each: true })
  @Type(() => UpdateCountryProperty)
  @ValidateNested({ each: true })
  readonly countries: UpdateCountryProperty[]

  @ApiProperty({
    description: 'List of shipping prices for the shipping zone',
    isArray: true,
    type: () => UpdateShippingPriceProperty,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @IsNotEmpty({ each: true })
  @ValidateNested({ each: true })
  @Type(() => UpdateShippingPriceProperty)
  readonly prices: UpdateShippingPriceProperty[]
}
