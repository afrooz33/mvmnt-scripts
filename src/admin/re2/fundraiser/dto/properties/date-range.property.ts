import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsDateString, IsOptional } from 'class-validator'

export class DateRange {
  @ApiPropertyOptional({
    name: 'start_date[leading_date]',
  })
  @IsOptional()
  @IsDateString()
  readonly leading_date: string

  @ApiPropertyOptional({
    name: 'start_date[trailing_date]',
  })
  @IsOptional()
  @IsDateString()
  readonly trailing_date: string
}
