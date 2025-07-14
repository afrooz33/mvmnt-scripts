import { Type } from 'class-transformer'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, IsNotEmpty } from 'class-validator'
import { DonationDateRange, DonationFiltersProperty } from './properties'

export class DonorListQueryDto {
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

  @ApiPropertyOptional({ type: DonationFiltersProperty })
  @Type(() => DonationFiltersProperty)
  @IsOptional()
  readonly filter?: DonationFiltersProperty

  @ApiPropertyOptional({
    type: DonationDateRange,
    name: 'donation_date',
    description: 'Donation Date',
  })
  @IsOptional()
  readonly donation_date?: DonationDateRange
}
