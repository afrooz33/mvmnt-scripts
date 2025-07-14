import { Type } from 'class-transformer'
import { IsOptional } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { MySearchDto } from '@app/src/shared/base'
import { CouponStatus } from '@app/src/admin/coupons/enums'
import { FiltersProperty } from './properties'

export class QueryDto extends MySearchDto {
  @ApiPropertyOptional({
    description: 'Coupon status',
    type: 'enum',
    enum: [CouponStatus.ENABLED, CouponStatus.SCHEDULED, CouponStatus.EXPIRED],
  })
  @IsOptional()
  readonly status: CouponStatus

  @ApiPropertyOptional({ type: FiltersProperty })
  @Type(() => FiltersProperty)
  @IsOptional()
  readonly filter?: FiltersProperty
}
