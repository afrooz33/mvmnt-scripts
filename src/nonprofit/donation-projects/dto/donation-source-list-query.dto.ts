import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, IsNotEmpty, IsEnum } from 'class-validator'
import { OrderDirection } from '@app/src/shared/enums'
import { DonationSourceStatus } from '@app/src/nonprofit/donation-projects/enums'
import {
  DonationSourceEndDateRange,
  DonationSourceTotalDonation,
  DonationSourceStartDateRange,
} from './properties'

export class DonationSourceListQueryDto {
  @ApiPropertyOptional({
    description: 'Donation source status',
    enum: Object.values(DonationSourceStatus),
  })
  @IsOptional()
  readonly donation_source_status?: DonationSourceStatus

  @ApiPropertyOptional({
    description: 'Search by keyword',
  })
  @IsOptional()
  @IsString()
  readonly keyword?: string

  @ApiPropertyOptional({
    description: 'Order by',
    default: 'created',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly order_by?: string

  @ApiPropertyOptional({
    description: 'Order direction',
    enum: Object.values(OrderDirection),
    default: OrderDirection.DESCENDING,
  })
  @IsOptional()
  @IsEnum(OrderDirection)
  readonly order_direction?: OrderDirection

  @ApiPropertyOptional({
    description: 'Page',
    default: 1,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly page?: string

  @ApiPropertyOptional({
    description: 'Results per page',
    default: 10,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly limit?: string

  @ApiPropertyOptional({
    type: DonationSourceStartDateRange,
    name: 'donation_source_start_date',
    description: 'Donation source start date',
  })
  @IsOptional()
  readonly donation_source_start_date?: DonationSourceStartDateRange

  @ApiPropertyOptional({
    type: DonationSourceEndDateRange,
    name: 'donation_source_end_date',
    description: 'Donation source end date',
  })
  @IsOptional()
  readonly donation_source_end_date?: DonationSourceEndDateRange

  @ApiPropertyOptional({
    type: DonationSourceTotalDonation,
    name: 'total_donation',
    description: 'Donation source total donation',
  })
  @IsOptional()
  readonly total_donation?: DonationSourceTotalDonation
}
