import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, IsNotEmpty } from 'class-validator'
import { DealStatus } from '@app/src/users/deal/enums'
import { DonationSourceTotalDonation } from '@app/src/nonprofit/donation-projects/dto/properties'
import { NoContributorRangeProperty } from './properties'

export class DonationSourceQueryDto {
  @ApiPropertyOptional({
    description: 'Donation source status',
    enum: Object.values(DealStatus),
  })
  @IsOptional()
  readonly donation_source_status?: DealStatus

  @ApiPropertyOptional({
    description: 'Page',
    default: 1,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly page?: string

  @ApiPropertyOptional({
    description: 'Donation source',
  })
  @IsOptional()
  readonly source_id?: string

  @ApiPropertyOptional({
    description: 'Results per page',
    default: 10,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly limit?: string

  @ApiPropertyOptional({
    type: NoContributorRangeProperty,
    name: 'no_contributor',
    description: 'Donation source total donation',
  })
  @IsOptional()
  readonly no_contributor?: NoContributorRangeProperty

  @ApiPropertyOptional({
    type: DonationSourceTotalDonation,
    name: 'total_donation',
    description: 'Donation source gross donation',
  })
  @IsOptional()
  readonly total_donation?: DonationSourceTotalDonation
}
