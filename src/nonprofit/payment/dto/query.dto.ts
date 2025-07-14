import { Type } from 'class-transformer'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, ValidateNested } from 'class-validator'
import { MySearchDto } from '@app/src/shared/base'
import { DateRange } from './properties'

export class QueryDto extends MySearchDto {
  @ApiPropertyOptional({
    type: DateRange,
    name: 'donation_date',
    description: 'Donation date range',
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => DateRange)
  readonly donation_date?: DateRange
}
