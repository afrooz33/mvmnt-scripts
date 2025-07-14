import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsDateString, IsNotEmpty } from 'class-validator'

export class EndDateRange {
  @ApiPropertyOptional({
    name: 'end_date[end_date][leading_date]',
  })
  @IsNotEmpty()
  @IsDateString()
  readonly leading_date: string

  @ApiPropertyOptional({
    name: 'end_date[end_date][trailing_date]',
  })
  @IsNotEmpty()
  @IsDateString()
  readonly trailing_date: string
}
