import { Type } from 'class-transformer'
import { IsEnum, IsOptional } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { MySearchDto } from '@app/src/shared/base'
import { DonationType } from '@app/src/donations/enums'
import { DonationAmountRange, DonationDateRange } from './properties'

export class DonationSourceDonorListDto extends MySearchDto {
  @ApiPropertyOptional({
    description: 'Donation source type',
    enum: Object.values(DonationType),
  })
  @IsOptional()
  @IsEnum(DonationType, {
    message: 'Invalid donation source type.',
  })
  readonly donation_type?: DonationType

  @ApiPropertyOptional({
    description: 'Donation amount starting range',
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
