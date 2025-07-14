import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty, IsString, IsUUID, IsNumber, Min, IsOptional } from 'class-validator'

export class InitiateAuctionPaymentDto {
  @ApiProperty({
    description: 'Bid id',
    example: '5e36a4b2-9c02-4f37-b823-1ac4b72170b5',
    format: 'uuid',
  })
  @IsUUID()
  @IsDefined()
  @IsNotEmpty()
  readonly bid: string

  @ApiProperty({
    description: 'Token address for the Payment Currency',
    example: '0x9cee8B6C0520853fB898d6a4d2d67048768b4dB6',
  })
  @IsDefined()
  @IsString()
  readonly payment_currency: string

  @ApiProperty({
    description: 'ID of the payment method being used',
    format: 'uuid',
    example: 'd2979a21-a823-4d92-9ed7-3c6fc5b20868',
  })
  @IsUUID()
  @IsDefined()
  @IsString()
  readonly payment_method: string

  @ApiPropertyOptional({
    description: 'Points to be used for the payment',
    example: 100,
  })
  @Min(1)
  @IsOptional()
  @IsNumber({
    maxDecimalPlaces: 0,
    allowInfinity: false,
    allowNaN: false,
  })
  readonly points?: number
}
