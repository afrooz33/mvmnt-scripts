import { ApiProperty } from '@nestjs/swagger'
import {
  IsUUID,
  IsArray,
  IsDefined,
  IsNotEmpty,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'
import { CreateShippingProfileDto } from './create-shipping-profile.dto'
import { UpdateShippingZoneProperty } from './properties'

export class UpdateShippingProfileDto extends CreateShippingProfileDto {
  @ApiProperty({
    required: false,
    description: 'Shipping profile id',
    format: 'uuid',
    example: 'c75d1299-7697-4a75-a1a6-4fe699cb2a5b',
  })
  @IsUUID()
  @IsDefined()
  @IsNotEmpty()
  readonly id: string

  @ApiProperty({
    description: 'List of shipping zones',
    isArray: true,
    type: () => UpdateShippingZoneProperty,
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsNotEmpty({ each: true })
  @ValidateNested({ each: true })
  @Type(() => UpdateShippingZoneProperty)
  readonly zones?: UpdateShippingZoneProperty[]
}
