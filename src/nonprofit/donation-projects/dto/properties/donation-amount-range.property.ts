import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsDateString, IsOptional } from 'class-validator'

export class DonationAmountRange {
  @ApiPropertyOptional({
    name: 'amount[start]',
  })
  @IsOptional()
  @IsDateString()
  readonly start: number

  @ApiPropertyOptional({
    name: 'amount[end]',
  })
  @IsOptional()
  @IsDateString()
  readonly end: number
}
