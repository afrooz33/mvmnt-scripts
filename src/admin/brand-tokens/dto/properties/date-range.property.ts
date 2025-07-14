import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsDateString, IsOptional } from 'class-validator'

export class DateRange {
  @ApiPropertyOptional({
    name: 'created_date[leading_date]',
  })
  @IsOptional()
  @IsDateString()
  readonly leading_date: string

  @ApiPropertyOptional({
    name: 'created_date[trailing_date]',
  })
  @IsOptional()
  @IsDateString()
  readonly trailing_date: string
}
