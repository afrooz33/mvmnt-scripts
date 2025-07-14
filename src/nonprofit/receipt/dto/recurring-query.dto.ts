import { Type } from 'class-transformer'
import { IsOptional, IsString } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { MySearchDto } from '@app/src/shared/base'
import { TotalDonation } from '@app/src/nonprofit/donation-projects/dto/properties'
import { UserDonationFiltersProperty, DonationDateRange, NextTotalDonation } from './properties'

export class RecurringQueryDto extends MySearchDto {
  @ApiPropertyOptional({
    description: 'Search by keyword',
  })
  @IsOptional()
  @IsString()
  readonly keyword?: string

  @ApiPropertyOptional({
    type: NextTotalDonation,
    name: 'next_donation',
    description: 'Next donation',
  })
  @IsOptional()
  readonly next_donation?: NextTotalDonation

  @ApiPropertyOptional({
    type: TotalDonation,
    name: 'total_donations',
    description: 'Total donations',
  })
  @IsOptional()
  readonly total_donations?: TotalDonation

  @ApiPropertyOptional({ type: UserDonationFiltersProperty })
  @Type(() => UserDonationFiltersProperty)
  @IsOptional()
  readonly filter?: UserDonationFiltersProperty

  @ApiPropertyOptional({
    type: DonationDateRange,
    description: 'Donation date',
  })
  @IsOptional()
  readonly donation_date?: DonationDateRange
}
