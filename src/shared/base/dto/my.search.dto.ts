import { IsAllowedSearchField } from '@app/src/shared/validations'
import { OrderDirection } from '@app/src/shared/enums'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsArray, ArrayMinSize, IsEnum, IsNotEmpty, IsString } from 'class-validator'

/**
 * Search DTO parent class
 * @class
 * @classdesc Search DTO
 * @property {string} keyword - Search by keyword
 * @property {string[]} search_fields - Search with fields
 * @property {string} order_by - Order by
 * @property {OrderDirection} order_direction - Order direction asc|desc
 * @property {string} page - Page
 * @property {string} limit - Results per page
 * @example
 * {
 *  "keyword": "search term",
 *  "search_fields": ["allowed_search_field"],
 *  "order_by": "created|updated|name|etc",
 *  "order_direction": "asc|desc",
 *  "page": 1,
 *  "limit": 10
 * }
 */
export class MySearchDto {
  constructor(_searchFields: Record<string, string>) {
    this._searchFields = _searchFields
  }

  @IsOptional()
  _searchFields: Record<string, string>

  @ApiPropertyOptional({
    description: 'Search by keyword',
  })
  @IsOptional()
  @IsString()
  readonly keyword?: string

  @ApiPropertyOptional({
    name: 'search_fields[]',
    description: 'Search with fields',
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsAllowedSearchField('_searchFields', {
    message: 'Invalid search field',
    each: true,
  })
  search_fields?: [string]

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
}
