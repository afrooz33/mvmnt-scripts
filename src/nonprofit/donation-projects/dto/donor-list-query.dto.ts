import { Type } from 'class-transformer'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { OrderDirection } from '@app/src/shared/enums'
import { DonationType } from '@app/src/donations/enums'
import { DonationDateRange, DonationAmountRange } from './properties'

export class DonorListQueryDto {
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
