import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsDateString, IsOptional } from 'class-validator'

export class DonationDateRange {
  @ApiPropertyOptional({
    name: 'donation_date[start]',
  })
  @IsOptional()
  @IsDateString()
  readonly start: string

  @ApiPropertyOptional({
    name: 'donation_date[end]',
  })
  @IsOptional()
  @IsDateString()
  readonly end: string
}
