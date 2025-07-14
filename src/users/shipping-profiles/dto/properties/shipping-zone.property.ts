import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import {
  IsArray,
  IsDefined,
  IsNotEmpty,
  ArrayMinSize,
  ArrayMaxSize,
  ValidateNested,
} from 'class-validator'
import { CountryProperty } from './country.property'
import { ShippingPriceProperty } from './shipping-price.property'

export class ShippingZoneProperty {
  @ApiProperty({
    type: 'string',
    description: 'Name of the shipping zone',
    example: 'Standard Shipping',
  })
  @IsDefined()
  @IsNotEmpty()
  readonly name: string

  @ApiProperty({
    type: [CountryProperty],
    description: 'List of countries that the shipping zone is applicable to',
  })
  @IsArray()
  @IsDefined()
  @ArrayMinSize(1)
  @IsNotEmpty({ each: true })
  @Type(() => CountryProperty)
  @ValidateNested({ each: true })
  readonly countries: CountryProperty[]

  @ApiProperty({
    description: 'List of shipping prices for the shipping zone',
    isArray: true,
    type: () => ShippingPriceProperty,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @IsNotEmpty({ each: true })
  @ValidateNested({ each: true })
  @Type(() => ShippingPriceProperty)
  readonly prices: ShippingPriceProperty[]
}
