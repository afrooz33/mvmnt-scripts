import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsDateString, IsOptional } from 'class-validator'

export class PriceRangeProperty {
  @ApiPropertyOptional({
    name: 'price[start]',
  })
  @IsOptional()
  @IsDateString()
  readonly start: string

  @ApiPropertyOptional({
    name: 'price[end]',
  })
  @IsOptional()
  @IsDateString()
  readonly end: string
}
