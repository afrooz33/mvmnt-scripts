import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsDateString, IsOptional } from 'class-validator'

export class LastLoginRangeProperty {
  @ApiPropertyOptional({
    name: 'last_login[start]',
  })
  @IsOptional()
  @IsDateString()
  readonly start: string

  @ApiPropertyOptional({
    name: 'last_login[end]',
  })
  @IsOptional()
  @IsDateString()
  readonly end: string
}
