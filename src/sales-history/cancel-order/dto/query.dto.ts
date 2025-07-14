import { IsEnum, IsOptional } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { MySearchDto } from '@app/src/shared/base'
import { DateRange } from '@app/src/admin/re2/fundraiser/dto/properties'

export class QueryDto extends MySearchDto {
  @ApiPropertyOptional({
    type: String,
    description: 'Filter by status',
  })
  @IsOptional()
  @IsEnum(['not_shipped', 'shipped', 'cancelled', 'returned', 'exchanged'])
  status?: string

  @ApiPropertyOptional({
    type: DateRange,
    description: 'Filter by purchase date',
  })
  @IsOptional()
  purchase_date?: DateRange
}
