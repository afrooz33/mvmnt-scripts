import { Type } from 'class-transformer'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional } from 'class-validator'
import { MySearchDto } from '@app/src/shared/base'
import { NewsSearchFields } from '@app/src/shared/enums'
import { FilterStatusProperty } from './properties'
import { DateRange } from './properties/date-range.property'

export class QueryDto extends MySearchDto {
  constructor() {
    super(NewsSearchFields)
  }

  @ApiPropertyOptional({ type: FilterStatusProperty })
  @Type(() => FilterStatusProperty)
  @IsOptional()
  readonly filter?: FilterStatusProperty

  @ApiPropertyOptional({ description: 'Published start and end date' })
  @IsOptional()
  @IsNotEmpty()
  readonly start_date?: DateRange
}
