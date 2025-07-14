import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsOptional } from 'class-validator'
import { FilterStatus } from '@app/src/nonprofit/news/enums'

export class FilterStatusProperty {
  @ApiPropertyOptional({
    name: 'filter[status]',
    description: 'Filter',
    enum: Object.values(FilterStatus),
  })
  @IsOptional()
  @IsEnum(FilterStatus)
  status: FilterStatus
}
