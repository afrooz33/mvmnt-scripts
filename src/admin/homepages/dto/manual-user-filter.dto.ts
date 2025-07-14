import { Type } from 'class-transformer'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, IsOptional, IsEnum, IsNotEmpty, IsArray, ArrayMaxSize } from 'class-validator'
import { DealType } from '@app/src/users/deal/enums'
import { OrderDirection } from '@app/src/shared/enums'
import {
  TotalSalesRangeProperty,
  ContributionAmountRangeProperty,
} from '@app/src/admin/deals/dto/properties'
import { GrossDonationRangeProperty } from '@app/src/admin/donation-projects/dto/properties'
import { FiltersProperty } from './properties'

export class ManualUserFilterDto {
  @ApiPropertyOptional({
    description: 'Search by keyword',
  })
  @IsString()
  @IsOptional()
  readonly keyword?: string

  @ApiPropertyOptional({
    description: 'Order by',
    default: 'created',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly order_by?: string

  @ApiPropertyOptional({
    description: 'Order direction',
    enum: Object.values(OrderDirection),
    default: OrderDirection.DESCENDING,
  })
  @IsOptional()
  @IsEnum(OrderDirection)
  readonly order_direction?: OrderDirection

  @ApiPropertyOptional({
    description: 'Page',
    default: 1,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly page?: string

  @ApiPropertyOptional({
    description: 'Results per page',
    default: 10,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly limit?: string

  @ApiPropertyOptional({
    isArray: true,
    description: 'Categories',
    format: 'uuid',
  })
  @IsArray()
  @IsOptional()
  @ArrayMaxSize(5)
  readonly categories?: string[]

  @ApiPropertyOptional({
    isArray: true,
    description: 'Brands',
    format: 'uuid',
  })
  @IsArray()
  @IsOptional()
  @ArrayMaxSize(5)
  readonly brands?: string[]

  @ApiPropertyOptional({
    description: 'Deal type',
    enum: Object.values(DealType),
  })
  @IsOptional()
  @IsEnum(DealType)
  readonly deal_type?: DealType

  @ApiPropertyOptional({ type: FiltersProperty })
  @Type(() => FiltersProperty)
  @IsOptional()
  readonly filter?: FiltersProperty

  @ApiPropertyOptional({
    description: 'Contribution amount',
    type: ContributionAmountRangeProperty,
  })
  @IsOptional()
  readonly contribution_amount?: ContributionAmountRangeProperty

  @ApiPropertyOptional({
    description: 'Total gross donations',
    type: GrossDonationRangeProperty,
  })
  @IsOptional()
  readonly gross_donations?: GrossDonationRangeProperty

  @ApiPropertyOptional({
    description: 'Total purchases',
    type: TotalSalesRangeProperty,
  })
  @IsOptional()
  readonly total_sales?: TotalSalesRangeProperty
}
