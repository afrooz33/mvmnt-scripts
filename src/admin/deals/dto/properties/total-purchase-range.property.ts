import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsDateString, IsOptional } from 'class-validator'

export class TotalPurchaseRangeProperty {
  @ApiPropertyOptional({
    name: 'buynow_participants[start]',
  })
  @IsOptional()
  @IsDateString()
  readonly start: string

  @ApiPropertyOptional({
    name: 'buynow_participants[end]',
  })
  @IsOptional()
  @IsDateString()
  readonly end: string
}
