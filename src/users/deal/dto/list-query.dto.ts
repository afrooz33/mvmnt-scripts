import { Type } from 'class-transformer'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsArray, IsString, IsOptional, IsNotEmpty, ArrayMaxSize } from 'class-validator'
import { OrderDirection } from '@app/src/shared/enums'
import { IsBrandAvailable } from '@app/src/shared/decorators'
import { FiltersProperty, PriceRangeProperty, DonationRangeProperty } from './properties'

export class ListQueryDto {
  @ApiPropertyOptional({
    description: 'Search by keyword',
  })
  @IsOptional()
  @IsString()
  readonly keyword?: string

  @ApiPropertyOptional({
    description: 'Order by',
    default: 'start_date',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  order_by?: string

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
  @IsBrandAvailable({
    message: 'Invalid brand',
  })
  readonly brand?: string[]

  @ApiPropertyOptional({
    name: 'includeIds[donation_nonprofit][]',
    description: 'Nonprofit',
    isArray: true,
  })
  @IsArray()
  @IsOptional()
  @ArrayMaxSize(5)
  readonly donation_nonprofit?: string[]

  @ApiPropertyOptional({
    name: 'includeIds[donation_project][]',
    description: 'Donation project',
    isArray: true,
  })
  @IsArray()
  @IsOptional()
  @ArrayMaxSize(5)
  readonly donation_project?: string[]

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
    description: 'Price range',
  })
  @IsOptional()
  @Type(() => PriceRangeProperty)
  readonly price?: PriceRangeProperty

  @ApiPropertyOptional({
    description: 'Donation amount range',
  })
  @IsOptional()
  @Type(() => DonationRangeProperty)
  readonly donation?: DonationRangeProperty

  @ApiPropertyOptional({
    description: 'User account type',
    isArray: true,
    enum: ['business', 'personal', 'influencer'],
  })
  @IsOptional()
  readonly user_account_type?: string[]

  @ApiPropertyOptional({
    description: 'Item type',
    isArray: true,
    enum: ['general', 'official'],
  })
  @IsOptional()
  readonly item_type?: string[]

  // ToDo: add SNS followers filter
}
