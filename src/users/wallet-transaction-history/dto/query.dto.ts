import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsEnum, IsUUID, IsNotEmpty, IsDefined } from 'class-validator'
import { MyPaginateDto } from '@app/src/shared/base'
import {
  TransactionCategory,
  WalletHistoryTransactionType,
} from '@app/src/users/wallet-transaction-history/enums'

export class QueryDto extends MyPaginateDto {
  @ApiProperty({
    description: 'Show only MVMNT wallet transactions',
    enum: ['Y', 'N'],
    required: true,
  })
  @IsEnum(['Y', 'N'])
  @IsDefined()
  @IsNotEmpty()
  readonly is_mvmnt: 'Y' | 'N'

  @ApiPropertyOptional({
    description: 'Start date for filtering transactions',
    example: '2023-01-01',
    required: false,
  })
  @IsOptional()
  readonly start_date?: string

  @ApiPropertyOptional({
    description: 'End date for filtering transactions',
    example: '2023-12-31',
    required: false,
  })
  @IsOptional()
  readonly end_date?: string

  @ApiPropertyOptional({
    description: 'Transaction type filter',
    enum: WalletHistoryTransactionType,
    required: false,
  })
  @IsOptional()
  @IsEnum(WalletHistoryTransactionType)
  readonly transaction_type?: WalletHistoryTransactionType

  @ApiPropertyOptional({
    description: 'Transaction category filter',
    enum: TransactionCategory,
    required: false,
  })
  @IsOptional()
  @IsEnum(TransactionCategory)
  readonly transaction_category?: TransactionCategory

  @ApiPropertyOptional({
    description: 'Wallet ID filter',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  readonly wallet?: string
}
