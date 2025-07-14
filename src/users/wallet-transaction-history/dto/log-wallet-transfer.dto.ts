import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsString, IsUUID, IsOptional, Matches } from 'class-validator'

export class LogWalletTransferDto {
  @ApiProperty({
    description: "ID of the logged-in user's wallet from which tokens are sent.",
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  readonly sender_wallet: string

  @ApiProperty({
    description: "Address of the receiver's wallet.",
    example: '0x0123456789abcdef0123456789abcdef01234567',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^0x[a-fA-F0-9]{40}$/, {
    message: 'Receiver wallet address must be a valid hexadecimal address.',
  })
  readonly receiver_wallet_address: string

  @ApiProperty({
    description: 'ID of the currency (TokenWhitelistEntity) being transferred.',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsUUID()
  @IsNotEmpty()
  readonly currency: string

  @ApiProperty({
    description: 'Amount of token being transferred.',
    example: '100.75',
  })
  @IsNotEmpty()
  readonly amount: string

  @ApiPropertyOptional({
    description: 'Transaction hash if the transfer occurred on-chain.',
    example: '0x789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123',
  })
  @IsString()
  @IsOptional()
  @Matches(/^0x[a-fA-F0-9]{64}$/, {
    message: 'Transaction hash must be a valid hexadecimal string.',
  })
  readonly transaction_hash?: string
}
