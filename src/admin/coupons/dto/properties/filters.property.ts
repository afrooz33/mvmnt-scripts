import { IsEnum, IsOptional } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { AdminFilterCouponType } from '@app/src/admin/coupons/enums'

export class FiltersProperty {
  @ApiPropertyOptional({
    name: 'filter[coupon_type]',
    description: 'Filter by coupon type',
    enum: Object.values(AdminFilterCouponType),
  })
  @IsOptional()
  @IsEnum(AdminFilterCouponType)
  readonly coupon_type: AdminFilterCouponType
}
