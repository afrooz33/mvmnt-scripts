import { Type } from 'class-transformer'
import { IsOptional } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { MySearchDto } from '@app/src/shared/base'
import {
  DonationFiltersProperty,
  DonationAmountRange,
  DonationDateRange,
} from '@app/src/nonprofit/donation-projects/dto/properties'

export class DonationSourceDonorQueryDto extends MySearchDto {
  @ApiPropertyOptional({ type: DonationFiltersProperty })
  @Type(() => DonationFiltersProperty)
  @IsOptional()
  readonly filter?: DonationFiltersProperty

  @ApiPropertyOptional({
    description: 'Donation source id',
    type: String,
  })
  @IsOptional()
  readonly source_id?: string

  @ApiPropertyOptional({
    description: 'Gross donation amount',
    type: DonationAmountRange,
  })
  @Type(() => DonationAmountRange)
  @IsOptional()
  readonly amount?: DonationAmountRange

  @ApiPropertyOptional({
    type: DonationDateRange,
    name: 'donation_start_date',
    description: 'Donation Start Date',
  })
  @IsOptional()
  readonly start_date?: DonationDateRange
}
