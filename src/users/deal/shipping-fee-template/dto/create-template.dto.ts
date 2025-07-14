import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty, MaxLength } from 'class-validator'
import { ShippingFee } from './properties'

export class CreateShippingFeeTemplateDto {
  @ApiProperty({
    name: 'title',
    description: 'Title',
  })
  @IsNotEmpty()
  @IsDefined()
  @MaxLength(255)
  readonly title: string

  @ApiProperty({
    name: 'shipping_fees',
    description: 'Shipping fees',
    type: [ShippingFee],
  })
  @IsNotEmpty()
  @IsDefined()
  readonly shipping_fees: ShippingFee[]
}
