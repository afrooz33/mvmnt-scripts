import { IsDefined, IsNotEmpty, IsOptional } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class DealShippingFee {
  @ApiProperty({
    type: 'number',
    format: 'int',
  })
  @IsDefined()
  @IsNotEmpty()
  readonly min_amount: number

  @ApiPropertyOptional({
    type: 'number',
    format: 'int',
  })
  @IsOptional()
  readonly max_amount: number

  @ApiProperty({
    type: 'number',
    format: 'int',
    required: true,
  })
  @IsDefined()
  @IsNotEmpty()
  readonly fee: number
}
