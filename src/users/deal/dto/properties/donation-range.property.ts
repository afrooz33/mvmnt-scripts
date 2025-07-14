import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsDateString, IsOptional } from 'class-validator'

export class DonationRangeProperty {
  @ApiPropertyOptional({
    name: 'donation[start]',
  })
  @IsOptional()
  @IsDateString()
  readonly start: string

  @ApiPropertyOptional({
    name: 'donation[end]',
  })
  @IsOptional()
  @IsDateString()
  readonly end: string
}
