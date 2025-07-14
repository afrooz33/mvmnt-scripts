import { IsOptional, IsUUID } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class FiltersProperty {
  @ApiPropertyOptional({
    name: 'filter[tag]',
    description: 'Filter by tag',
    format: 'uuid',
  })
  @IsUUID()
  @IsOptional()
  readonly tag?: string

  @ApiPropertyOptional({
    name: 'filter[wishlist]',
    description: 'Filter by wishlist',
    format: 'uuid',
  })
  @IsUUID()
  @IsOptional()
  readonly wishlist?: string
}
