import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsDateString, IsOptional } from 'class-validator'

export class LastSentDateRangeProperty {
  @ApiPropertyOptional({
    name: 'last_sent[leading_date]',
  })
  @IsOptional()
  @IsDateString()
  readonly leading_date: string

  @ApiPropertyOptional({
    name: 'last_sent[trailing_date]',
  })
  @IsOptional()
  @IsDateString()
  readonly trailing_date: string
}
