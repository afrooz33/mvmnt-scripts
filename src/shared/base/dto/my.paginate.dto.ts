import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsNotEmpty, IsString } from 'class-validator'

/**
 * Paginate DTO class
 * @class
 * @classdesc Paginate DTO
 * @property {string} page - Page
 * @property {string} limit - Results per page
 * @example
 * {
 *  "page": 1,
 *  "limit": 10
 * }
 */
export class MyPaginateDto {
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
