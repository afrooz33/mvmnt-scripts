import { IsOptional } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { DonationProjectBaseDto } from './donation-project-base.dto'
import { GrossDonationRangeProperty, TotalDonorRangeProperty } from './properties'

export class QueryDto extends DonationProjectBaseDto {
  @ApiPropertyOptional({
    description: 'Total gross donations',
    example: 100,
    type: GrossDonationRangeProperty,
  })
  @IsOptional()
  readonly gross_donations?: GrossDonationRangeProperty

  @ApiPropertyOptional({
    description: 'Total contributors',
    example: 100,
    type: TotalDonorRangeProperty,
  })
  @IsOptional()
  readonly total_donors?: TotalDonorRangeProperty
}
