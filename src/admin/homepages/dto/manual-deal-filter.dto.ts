import { Type } from 'class-transformer'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, IsOptional, IsEnum, IsNotEmpty, IsArray, ArrayMaxSize } from 'class-validator'
import { OrderDirection } from '@app/src/shared/enums'
import { PriceRangeProperty } from '@app/src/users/deal/dto/properties'
import { GrossDonationRangeProperty } from '@app/src/admin/donation-projects/dto/properties'
import { DealFilterStatus, DealType, ShippingCoveredBy } from '@app/src/users/deal/enums'
import { FiltersProperty } from './properties'

export class ManualDealFilterDto {
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

  @IsOptional()
  readonly includeIds?: string[]

  @ApiPropertyOptional({ type: FiltersProperty })
  @Type(() => FiltersProperty)
  @IsOptional()
  readonly filter?: FiltersProperty

  @ApiPropertyOptional({
    name: 'includeIds[brand][]',
    description: 'Brand',
    isArray: true,
  })
  @IsArray()
  @IsOptional()
  @ArrayMaxSize(5)
  readonly brand?: string[]

  @ApiPropertyOptional({
    name: 'includeIds[category][]',
    description: 'Category',
    isArray: true,
  })
  @IsArray()
  @IsOptional()
  @ArrayMaxSize(5)
  readonly category?: string[]

  @ApiPropertyOptional({
    description: 'Deal type',
    enum: Object.values(DealType),
  })
  @IsOptional()
  @IsEnum(DealType)
  readonly deal_type?: DealType

  @ApiPropertyOptional({
    description: 'Deal status',
    enum: Object.values(DealFilterStatus),
  })
  @IsOptional()
  @IsEnum(DealFilterStatus)
  readonly status?: DealFilterStatus

  @ApiPropertyOptional({
    description: 'Deal shipping covered by',
    enum: Object.values(ShippingCoveredBy),
  })
  @IsOptional()
  @IsEnum(ShippingCoveredBy)
  readonly shipping_covered_by?: ShippingCoveredBy

  @ApiPropertyOptional({
    description: 'Total gross donations',
    type: GrossDonationRangeProperty,
  })
  @IsOptional()
  readonly gross_donations?: GrossDonationRangeProperty

  @ApiPropertyOptional({
    description: 'Price range',
  })
  @IsOptional()
  @Type(() => PriceRangeProperty)
  readonly price?: PriceRangeProperty
}
