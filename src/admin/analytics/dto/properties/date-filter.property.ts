import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsDateString, IsOptional } from 'class-validator'

export class DateFilterProperty {
  @ApiPropertyOptional({
    name: 'date_filter[start]',
  })
  @IsOptional()
  @IsDateString()
  readonly start: string

  @ApiPropertyOptional({
    name: 'date_filter[end]',
  })
  @IsOptional()
  @IsDateString()
  readonly end: string
}
