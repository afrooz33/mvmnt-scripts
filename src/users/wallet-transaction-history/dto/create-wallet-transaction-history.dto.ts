import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsUUID, IsString, IsOptional, IsNotEmpty } from 'class-validator'
import {
  TransactionCategory,
  TransactionFlowIndicator,
  WalletHistoryTransactionType,
} from '@app/src/users/wallet-transaction-history/enums'

export class CreateWalletTransactionHistoryDto {
  @ApiPropertyOptional({
    description: 'User ID who owns the wallet',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  readonly owner_user: string

  @ApiProperty({
    description: 'Wallet ID that is affected by this transaction',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  readonly affected_wallet: string

  @ApiProperty({
    description: 'Type of transaction',
    enum: WalletHistoryTransactionType,
    example: WalletHistoryTransactionType.TOKEN_DEPOSIT,
  })
  @IsEnum(WalletHistoryTransactionType)
  @IsNotEmpty()
  readonly transaction_type: WalletHistoryTransactionType

  @ApiPropertyOptional({
    description: 'Category of transaction',
    enum: TransactionCategory,
    example: TransactionCategory.TOKEN,
  })
  @IsOptional()
  @IsEnum(TransactionCategory)
  transaction_category?: TransactionCategory

  @ApiProperty({
    description: 'Indicator if transaction is flowing in or out of the wallet',
    enum: TransactionFlowIndicator,
    example: TransactionFlowIndicator.DEBIT,
  })
  @IsEnum(TransactionFlowIndicator)
  @IsNotEmpty()
  readonly flow_indicator: TransactionFlowIndicator

  @ApiPropertyOptional({
    description: 'Transaction amount',
    example: '100.50',
    required: false,
  })
  @IsOptional()
  amount?: any

  @ApiProperty({
    description: 'Currency ID for the transaction',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  readonly currency: string

  @ApiPropertyOptional({
    description: 'Whether this transaction involves point exchange',
    example: false,
    required: false,
    default: false,
  })
  @IsOptional()
  readonly is_point_exchange?: boolean

  @ApiPropertyOptional({
    description: 'Points amount for point exchange transactions',
    example: '1000',
    required: false,
  })
  @IsOptional()
  readonly points?: string

  @ApiPropertyOptional({
    description: 'Timestamp when the transaction occurred',
    example: '2023-01-01T12:00:00Z',
    required: false,
  })
  @IsOptional()
  readonly transaction_timestamp?: Date

  @ApiPropertyOptional({
    description: 'User deal payment ID (for deal purchases/sales)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsUUID()
  @IsOptional()
  readonly user_deal_payment?: string

  @ApiPropertyOptional({
    description: 'User deal item payment ID (for deal item purchases/sales)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsUUID()
  @IsOptional()
  readonly user_deal_item_payment?: string

  @ApiProperty({
    description: 'Whether this is a deal purchase transaction',
    example: true,
    required: false,
  })
  @IsOptional()
  readonly is_deal_purchase?: boolean

  @ApiPropertyOptional({
    description: 'Whether this is a deal sale transaction',
    example: false,
  })
  @IsOptional()
  readonly is_deal_sale?: boolean

  @ApiPropertyOptional({
    description: 'Donation ID (for donation transactions)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsUUID()
  @IsOptional()
  readonly donation?: string

  @ApiPropertyOptional({
    description: 'Nonprofit ID (for direct nonprofit donations)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsUUID()
  @IsOptional()
  readonly nonprofit?: string

  @ApiPropertyOptional({
    description: 'Donation project ID (for project donations)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsUUID()
  @IsOptional()
  readonly donation_project?: string

  @ApiPropertyOptional({
    description: 'Fundraiser ID (for RE2 fundraiser donations)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsUUID()
  @IsOptional()
  readonly fundraiser?: string

  @ApiPropertyOptional({
    description: 'Whether this is a RE2 integration donation',
    example: false,
  })
  @IsOptional()
  readonly is_re2_integration?: boolean

  @ApiPropertyOptional({
    description: 'Sender user ID (for user-to-user transfers)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsUUID()
  @IsOptional()
  readonly sender_user?: string

  @ApiPropertyOptional({
    description: 'Sender wallet ID (for user-to-user transfers)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsUUID()
  @IsOptional()
  readonly sender_wallet?: string

  @ApiPropertyOptional({
    description: 'External address of sender (for external transfers)',
    example: '0x1234567890abcdef',
  })
  @IsString()
  @IsOptional()
  readonly sender_external_address?: string

  @ApiPropertyOptional({
    description: 'Receiver user ID (for user-to-user transfers)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsUUID()
  @IsOptional()
  readonly receiver_user?: string

  @ApiPropertyOptional({
    description: 'Receiver wallet ID (for user-to-user transfers)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsUUID()
  @IsOptional()
  readonly receiver_wallet?: string

  @ApiPropertyOptional({
    description: 'External address of receiver (for external transfers)',
    example: '0x1234567890abcdef',
  })
  @IsString()
  @IsOptional()
  readonly receiver_external_address?: string

  @ApiPropertyOptional({
    description: 'Fee amount for the transaction',
    example: '2.50',
  })
  @IsOptional()
  readonly fee_amount?: string

  @ApiPropertyOptional({
    description: 'Currency ID for the fee',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsUUID()
  @IsOptional()
  readonly fee_currency?: string

  @IsOptional()
  readonly transaction_hash?: string
}
