import { Type } from 'class-transformer'
import { ArrayMinSize, IsArray, IsEnum, IsOptional } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { MySearchDto } from '@app/src/shared/base'
import { CouponSearchFields } from '@app/src/shared/enums'
import { IncludesQuery } from '@app/src/admin/coupons/enums'
import { EndDateRange, FiltersProperty } from './properties'

export class QueryDto extends MySearchDto {
  constructor() {
    super(CouponSearchFields)
  }

  @ApiPropertyOptional({
    type: EndDateRange,
    description: 'Coupon End Date',
  })
  @IsOptional()
  readonly end_date?: EndDateRange

  @ApiPropertyOptional({ type: FiltersProperty })
  @Type(() => FiltersProperty)
  @IsOptional()
  readonly filter?: FiltersProperty

  @ApiPropertyOptional({
    name: 'includes[]',
    description: 'Relations',
    isArray: true,
    enum: Object.values(IncludesQuery),
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(IncludesQuery, { each: true })
  readonly includes?: IncludesQuery[]
}
