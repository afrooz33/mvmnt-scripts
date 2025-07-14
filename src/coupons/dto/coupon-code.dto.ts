import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty } from 'class-validator'

export class CouponCodeDto {
  @ApiProperty({
    type: String,
    description: 'Coupon code',
    example: 'CUPONCODE',
  })
  @IsDefined()
  @IsNotEmpty()
  readonly coupon_code: string
}
