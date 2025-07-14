import { Type } from 'class-transformer'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, IsNotEmpty, IsEnum, IsArray } from 'class-validator'
import { OrderDirection } from '@app/src/shared/enums'
import { PriceRangeProperty } from './properties'

export class PublicListItemQueryDto {
  @ApiPropertyOptional({
    description: 'Search by keyword',
  })
  @IsOptional()
  @IsString()
  readonly keyword?: string

  @ApiPropertyOptional({
    description: 'Order by',
    default: 'created',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
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
    description: 'Price range',
  })
  @IsOptional()
  @Type(() => PriceRangeProperty)
  readonly price?: PriceRangeProperty

  @ApiPropertyOptional({
    description: 'Filter by wishlists',
    isArray: true,
    name: 'wishlists[]',
  })
  @IsArray()
  @IsOptional()
  readonly wishlists?: []

  @ApiPropertyOptional({
    description: 'Filter by nonprofit',
    isArray: true,
    name: 'nonprofits[]',
  })
  @IsArray()
  @IsOptional()
  readonly nonprofits?: []

  @ApiPropertyOptional({
    description: 'Filter by tags',
    isArray: true,
    name: 'tags[]',
  })
  @IsArray()
  @IsOptional()
  readonly tags?: []
}
