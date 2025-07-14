import { Type } from 'class-transformer'
import { IsOptional, IsArray, ArrayMaxSize, IsEnum } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { MySearchDto } from '@app/src/shared/base'
import { DealSearchFields } from '@app/src/shared/enums'
import { IncludesQuery } from '@app/src/admin/deals/enums'
import {
  EndDateRange,
  StartDateRange,
  FiltersProperty,
  TotalSalesRangeProperty,
  GrossDonationRangeProperty,
  TotalPurchaseRangeProperty,
} from './properties'

export class QueryDto extends MySearchDto {
  constructor() {
    super(DealSearchFields)
  }

  @ApiPropertyOptional({
    type: StartDateRange,
    name: 'start_date',
    description: 'Deal start date range',
  })
  @IsOptional()
  readonly start_date?: StartDateRange

  @ApiPropertyOptional({
    type: EndDateRange,
    name: 'end_date',
    description: 'Deal end date range',
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
  @ArrayMaxSize(15)
  @IsEnum(IncludesQuery, { each: true })
  readonly includes?: IncludesQuery[]

  @ApiPropertyOptional({
    description: 'Total gross donations',
    example: 100,
    type: GrossDonationRangeProperty,
  })
  @IsOptional()
  readonly gross_donation?: GrossDonationRangeProperty

  @ApiPropertyOptional({
    description: 'Total purchases',
    example: 100,
    type: TotalPurchaseRangeProperty,
  })
  @IsOptional()
  readonly buynow_participants?: TotalPurchaseRangeProperty

  @ApiPropertyOptional({
    description: 'Total purchases',
    example: 100,
    type: TotalSalesRangeProperty,
  })
  @IsOptional()
  readonly total_sales?: TotalSalesRangeProperty
}
