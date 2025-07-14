import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsDateString, IsOptional } from 'class-validator'

export class TotalDonor {
  @ApiPropertyOptional({
    name: 'total_donors[start]',
  })
  @IsOptional()
  @IsDateString()
  readonly start: string

  @ApiPropertyOptional({
    name: 'total_donors[end]',
  })
  @IsOptional()
  @IsDateString()
  readonly end: string
}
