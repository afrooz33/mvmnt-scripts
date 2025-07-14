import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsDateString, IsOptional } from 'class-validator'

export class TotalSalesRangeProperty {
  @ApiPropertyOptional({
    name: 'total_sales[start]',
  })
  @IsOptional()
  @IsDateString()
  readonly start: string

  @ApiPropertyOptional({
    name: 'total_sales[end]',
  })
  @IsOptional()
  @IsDateString()
  readonly end: string
}
