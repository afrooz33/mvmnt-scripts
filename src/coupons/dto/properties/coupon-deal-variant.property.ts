import { IsNotEmpty, IsOptional } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CouponDealVariantProperty {
  @ApiProperty({
    description: 'Deal id',
    format: 'uuid',
    example: '521dfb4b-ff7d-479e-b834-c29bae939df6',
  })
  @IsNotEmpty()
  readonly deal: string

  @ApiPropertyOptional({
    description: 'Variant id',
    format: 'uuid',
    default: '',
  })
  @IsOptional()
  readonly variant?: string
}
