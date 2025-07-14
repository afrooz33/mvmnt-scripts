import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsDateString, IsOptional } from 'class-validator'

export class EndDateRange {
  @ApiPropertyOptional({
    name: 'end_date[deadline_date][leading_date]',
  })
  @IsOptional()
  @IsDateString()
  readonly leading_date: string

  @ApiPropertyOptional({
    name: 'end_date[deadline_date][trailing_date]',
  })
  @IsOptional()
  @IsDateString()
  readonly trailing_date: string
}
