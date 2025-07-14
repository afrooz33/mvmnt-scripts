import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import {
  ArrayMinSize,
  IsArray,
  IsDefined,
  IsNotEmpty,
  IsUUID,
  ValidateNested,
} from 'class-validator'
import { DestinationCountryProperty } from './properties'

export class CreateDestinationPreferenceDto {
  @ApiProperty({
    description: 'Shipping profiles',
    type: [String],
    format: 'uuid',
    default: ['f7f73f4c-a221-4c9d-98ab-bb3dbda2a9d0'],
  })
  @IsUUID('4', { each: true })
  @IsDefined()
  @IsArray()
  @ArrayMinSize(1)
  readonly shipping_profiles: string[]

  @ApiProperty({
    description: 'Shipping origins',
    type: [String],
    format: 'uuid',
    default: ['3ad41278-5d1d-47a7-9c5f-b3a916fbbd7c'],
  })
  @IsUUID('4', { each: true })
  @IsDefined()
  @IsArray()
  @ArrayMinSize(1)
  readonly origins: string[]

  @ApiProperty({
    type: [DestinationCountryProperty],
    description: 'List of countries that the delivery settings is applicable to',
  })
  @IsArray()
  @IsDefined()
  @ArrayMinSize(1)
  @IsNotEmpty({ each: true })
  @Type(() => DestinationCountryProperty)
  @ValidateNested({ each: true })
  readonly countries: DestinationCountryProperty[]
}
