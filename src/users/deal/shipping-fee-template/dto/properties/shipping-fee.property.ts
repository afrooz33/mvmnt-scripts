import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty } from 'class-validator'

export class ShippingFee {
  @ApiProperty({
    name: 'min_amount',
    description: 'Minimum amount',
    type: Number,
  })
  @IsNotEmpty()
  @IsDefined()
  readonly min_amount: number

  @ApiProperty({
    name: 'max_amount',
    description: 'Maximum amount',
    type: Number,
  })
  @IsNotEmpty()
  @IsDefined()
  readonly max_amount: number

  @ApiProperty({
    name: 'fee',
    description: 'Fee',
    type: Number,
  })
  @IsNotEmpty()
  @IsDefined()
  readonly fee: number
}
