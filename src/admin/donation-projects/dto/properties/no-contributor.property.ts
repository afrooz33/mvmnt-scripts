import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsDateString } from 'class-validator'

export class NoContributorRangeProperty {
  @ApiPropertyOptional({
    name: 'no_contributor[start]',
  })
  @IsOptional()
  @IsDateString()
  readonly start: string

  @ApiPropertyOptional({
    name: 'no_contributor[end]',
  })
  @IsOptional()
  @IsDateString()
  readonly end: string
}
