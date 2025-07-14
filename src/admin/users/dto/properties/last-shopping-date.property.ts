import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsDateString, IsOptional } from 'class-validator'

export class LastShoppingDateRange {
  @ApiPropertyOptional({
    name: 'last_shopping_date[leading_date]',
  })
  @IsOptional()
  @IsDateString()
  readonly leading_date: string

  @ApiPropertyOptional({
    name: 'last_shopping_date[trailing_date]',
  })
  @IsOptional()
  @IsDateString()
  readonly trailing_date: string
}
