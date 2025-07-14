import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsDefined, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator'

export class InitiateBuynowPaymentDto {
  @ApiProperty({
    description: 'ID of the cart for Payment',
    format: 'uuid',
    example: 'd2979a21-a823-4d92-9ed7-3c6fc5b20868',
  })
  @IsDefined()
  @IsString()
  @IsUUID()
  readonly cart: string

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
  @IsDefined()
  @IsString()
  @IsUUID()
  readonly payment_method: string

  @ApiPropertyOptional({
    description: 'Points to be used for the payment',
    example: '100',
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
