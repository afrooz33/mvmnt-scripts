import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, IsNotEmpty } from 'class-validator'
import { TotalDonation } from '@app/src/nonprofit/donation-projects/dto/properties'

export class QueryDto {
  @ApiPropertyOptional({
    description: 'Search by keyword',
  })
  @IsOptional()
  @IsString()
  readonly keyword?: string

  @ApiPropertyOptional({
    description: 'Search by donation year',
  })
  @IsOptional()
  @IsString()
  readonly donation_year?: number

  @ApiPropertyOptional({
    type: TotalDonation,
    name: 'total_donations',
    description: 'Total donations',
  })
  @IsOptional()
  readonly total_donations?: TotalDonation

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
