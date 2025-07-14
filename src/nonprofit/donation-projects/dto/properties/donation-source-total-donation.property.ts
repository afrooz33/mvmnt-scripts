import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsDateString, IsOptional } from 'class-validator'

export class DonationSourceTotalDonation {
  @ApiPropertyOptional({
    name: 'total_donation[start]',
  })
  @IsOptional()
  @IsDateString()
  readonly start: string

  @ApiPropertyOptional({
    name: 'total_donation[end]',
  })
  @IsOptional()
  @IsDateString()
  readonly end: string
}
