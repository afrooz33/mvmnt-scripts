import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsDateString, IsOptional } from 'class-validator'

export class TotalDonation {
  @ApiPropertyOptional({
    name: 'total_donations[start]',
  })
  @IsOptional()
  @IsDateString()
  readonly start: string

  @ApiPropertyOptional({
    name: 'total_donations[end]',
  })
  @IsOptional()
  @IsDateString()
  readonly end: string
}
