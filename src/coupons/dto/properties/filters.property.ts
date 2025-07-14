import { IsOptional, IsEnum } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { CouponType } from '@app/src/admin/coupons/enums'

export class FiltersProperty {
  @ApiPropertyOptional({
    name: 'filter[coupon_type]',
    description: 'Coupon type',
    enum: Object.values(CouponType),
  })
  @IsOptional()
  @IsEnum(CouponType)
  readonly coupon_type?: CouponType
}
