import { IsNotEmpty, IsDefined } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { JwtDto } from '@app/src/shared/auth/dto'
import { AccountType } from '@app/src/shared/auth/enums'

export class NonprofitUserRO {
  @ApiProperty({ format: 'uuid' })
  @IsNotEmpty()
  @IsDefined()
  readonly id: string

  @ApiProperty()
  readonly email: string

  @ApiProperty({ enum: AccountType })
  readonly account_type: AccountType

  @ApiPropertyOptional({ type: JwtDto })
  readonly jwt?: JwtDto

  @ApiPropertyOptional()
  readonly total_donations?: number

  @ApiPropertyOptional()
  readonly total_donors?: number

  @ApiPropertyOptional()
  readonly profile?: any

  @ApiPropertyOptional()
  wallet_address?: string

  @ApiPropertyOptional()
  smart_account?: string
}
