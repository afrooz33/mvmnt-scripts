import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty, IsNumber, IsString, IsUUID, Min, IsOptional } from 'class-validator'

export class InitiateRafflePaymentDto {
  @ApiProperty({
    description: 'Deal id',
    example: '0d79240f-832e-4d37-b2dd-35ff317f2a50',
    format: 'uuid',
  })
  @IsNotEmpty()
  @IsString()
  @IsDefined()
  @IsUUID()
  readonly deal: string

  @ApiProperty({
    description: 'Raffle purchase quantity',
    example: 1,
    format: 'int',
    default: 1,
  })
  @IsNotEmpty()
  @IsDefined()
  @IsNumber()
  readonly quantity: number

  @ApiProperty({
    description: 'Token address for the Payment Currency',
    example: '0x9cee8B6C0520853fB898d6a4d2d67048768b4dB6',
  })
  @IsDefined()
  @IsNotEmpty()
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
