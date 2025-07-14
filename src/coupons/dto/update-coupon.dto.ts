import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty } from 'class-validator'
import { CreateCouponDto } from './create-coupon.dto'

export class UpdateCouponDto extends CreateCouponDto {
  @ApiProperty({
    description: 'Coupon ID',
    format: 'uuid',
    example: 'cf2d219f-7abe-480d-9ec1-381dad036213',
  })
  @IsDefined()
  @IsNotEmpty()
  readonly id: string
}
