import { IsOptional } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class FiltersProperty {
  @ApiPropertyOptional({
    name: 'filter[continent]',
    description: 'Filter by continent',
  })
  @IsOptional()
  readonly continent: string
}
