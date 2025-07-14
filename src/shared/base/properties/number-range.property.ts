import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsDateString, IsOptional } from 'class-validator'

export class NumberRangeProperty {
  @ApiPropertyOptional({
    name: '[start]',
  })
  @IsOptional()
  @IsDateString()
  readonly start: string

  @ApiPropertyOptional({
    name: '[end]',
  })
  @IsOptional()
  @IsDateString()
  readonly end: string
}
