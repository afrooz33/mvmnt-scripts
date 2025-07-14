import { Type } from 'class-transformer'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, IsNotEmpty } from 'class-validator'
import { DonationDateRange, UserDonationFiltersProperty } from './properties'

export class DonationQueryDto {
  @ApiPropertyOptional({
    description: 'Search by keyword',
  })
  @IsOptional()
  @IsString()
  readonly keyword?: string

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
}
