import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsDateString, IsOptional } from 'class-validator'

export class NextTotalDonation {
  @ApiPropertyOptional({
    name: 'next_donation[start]',
  })
  @IsOptional()
  @IsDateString()
  readonly start: string

  @ApiPropertyOptional({
    name: 'next_donation[end]',
  })
  @IsOptional()
  @IsDateString()
  readonly end: string
}
