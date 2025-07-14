import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsDefined, IsOptional } from 'class-validator'
import { IsUserDeal } from '@app/src/shared/decorators'
import { REQUEST_CONTEXT } from '@app/src/shared/interceptors'

export class CreateBidDto {
  @ApiProperty({
    description: 'Deal id',
    example: '0d79240f-832e-4d37-b2dd-35ff317f2a50',
    format: 'uuid',
  })
  @IsNotEmpty()
  @IsDefined()
  @IsUserDeal()
  deal: string

  @ApiProperty({
    description: 'Bid price',
    example: 100000,
    format: 'decimal',
    default: 999.99,
  })
  @IsNotEmpty()
  @IsDefined()
  bid_amount: number

  @ApiProperty({
    description: 'Bid quantity',
    example: 1,
    format: 'int',
    default: 1,
  })
  @IsNotEmpty()
  @IsDefined()
  quantity: number;

  @IsOptional()
  [REQUEST_CONTEXT]: string
}
