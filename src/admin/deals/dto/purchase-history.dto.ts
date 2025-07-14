import { IsOptional } from 'class-validator'
import { MySearchDto } from '@app/src/shared/base'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { GrossDonationRangeProperty, TotalSalesRangeProperty } from './properties'

export class PurchaseHistoryDto extends MySearchDto {
  @ApiPropertyOptional({
    description: 'Total gross donations',
    example: 100,
    type: GrossDonationRangeProperty,
  })
  @IsOptional()
  readonly gross_donation?: GrossDonationRangeProperty

  @ApiPropertyOptional({
    description: 'Total purchases',
    example: 100,
    type: TotalSalesRangeProperty,
  })
  @IsOptional()
  readonly total_sales?: TotalSalesRangeProperty
}
