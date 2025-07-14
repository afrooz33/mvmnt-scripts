import { Type } from 'class-transformer'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, ArrayMaxSize, IsArray, IsEnum } from 'class-validator'
import { MySearchDto } from '@app/src/shared/base'
import { ShippingMethodSearchFields } from '@app/src/shared/enums'
import { IncludesQuery } from '@app/src/admin/shipping-methods/enums'
import { FilterStatusProperty } from './properties'

export class QueryDto extends MySearchDto {
  constructor() {
    super(ShippingMethodSearchFields)
  }

  @ApiPropertyOptional({
    name: 'Shipping method status',
    type: FilterStatusProperty,
  })
  @Type(() => FilterStatusProperty)
  @IsOptional()
  readonly filter?: FilterStatusProperty

  @ApiPropertyOptional({
    name: 'includes[]',
    description: 'Relations',
    isArray: true,
    enum: Object.values(IncludesQuery),
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsEnum(IncludesQuery, { each: true })
  readonly includes?: IncludesQuery[]
}
