import { IsOptional } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { DonationDateRange } from './properties'

export class TopStatQueryDto {
  @ApiPropertyOptional({
    type: DonationDateRange,
    name: 'donation_date',
    description: 'Donation Date',
  })
  @IsOptional()
  readonly donation_date?: DonationDateRange
}
