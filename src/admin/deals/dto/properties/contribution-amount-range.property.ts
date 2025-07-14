import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsDateString, IsOptional } from 'class-validator'

export class ContributionAmountRangeProperty {
  @ApiPropertyOptional({
    name: 'contribution_amount[start]',
  })
  @IsOptional()
  @IsDateString()
  readonly start: string

  @ApiPropertyOptional({
    name: 'contribution_amount[end]',
  })
  @IsOptional()
  @IsDateString()
  readonly end: string
}
