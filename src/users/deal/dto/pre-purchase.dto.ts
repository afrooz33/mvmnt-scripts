import { IsUUID, IsNotEmpty, IsOptional } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class PrePurchaseDto {
  @ApiProperty({
    format: 'uuid',
    required: true,
    description: 'Deal ID',
  })
  @IsUUID()
  @IsNotEmpty()
  readonly deal: string

  @ApiPropertyOptional({
    type: 'number',
    required: false,
    description: 'Bid amount',
  })
  @IsOptional()
  readonly bid_amount: number

  @ApiPropertyOptional({
    type: 'number',
    required: false,
    description: 'Quantity',
  })
  @IsOptional()
  quantity: number
}
