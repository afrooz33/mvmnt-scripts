import { ApiProperty } from '@nestjs/swagger'
import { IsUUID, IsDefined, IsNotEmpty } from 'class-validator'
import { ShippingPriceProperty } from './shipping-price.property'

export class UpdateShippingPriceProperty extends ShippingPriceProperty {
  @ApiProperty({
    required: false,
    description: 'Shipping zone id',
    format: 'uuid',
    example: '1fc9c178-6617-4f90-8209-95d956bdeccc',
  })
  @IsUUID()
  @IsDefined()
  @IsNotEmpty()
  readonly id: string
}
