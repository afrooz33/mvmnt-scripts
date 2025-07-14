import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsDateString, IsOptional } from 'class-validator'

export class GrossDonationRangeProperty {
  @ApiPropertyOptional({
    name: 'gross_donations[start]',
  })
  @IsOptional()
  @IsDateString()
  readonly start: string

  @ApiPropertyOptional({
    name: 'gross_donations[end]',
  })
  @IsOptional()
  @IsDateString()
  readonly end: string
}
