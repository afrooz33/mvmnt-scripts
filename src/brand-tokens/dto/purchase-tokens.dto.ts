import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsNotEmpty, IsNumber, IsString, IsUUID, Min, MaxLength } from 'class-validator'

export class PurchaseTokensDto {
  @ApiProperty({
    description: 'ID of the offering phase',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty({ message: 'Offering phase ID is required' })
  @IsUUID()
  readonly phase: string

  @ApiProperty({
    description: 'Wallet address to receive tokens',
    example: '0x1234567890123456789012345678901234567890',
    maxLength: 42,
  })
  @IsNotEmpty({ message: 'Wallet address is required' })
  @IsString()
  @MaxLength(42, { message: 'Wallet address cannot exceed 42 characters' })
  readonly wallet_address: string

  @ApiProperty({
    description: 'Amount of tokens to purchase',
    example: 1000,
  })
  @IsNotEmpty({ message: 'Token amount is required' })
  @IsNumber()
  @Min(1, { message: 'Token amount must be greater than 0' })
  @Type(() => Number)
  readonly token_amount: number

  @ApiProperty({
    description: 'Amount in USD to contribute',
    example: 100,
  })
  @IsNotEmpty({ message: 'Contribution amount is required' })
  @IsNumber()
  @Min(0.01, { message: 'Contribution amount must be greater than 0' })
  @Type(() => Number)
  readonly contribution_amount: number

  @ApiProperty({
    description: 'Payment amount in USD',
    example: 100,
  })
  @IsNotEmpty({ message: 'Payment amount is required' })
  @IsNumber()
  @Min(0.01, { message: 'Payment amount must be greater than 0' })
  @Type(() => Number)
  readonly payment_amount: number
}
