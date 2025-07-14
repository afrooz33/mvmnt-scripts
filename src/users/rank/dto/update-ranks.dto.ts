import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsArray, IsDefined, IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator'

export class WalletBalance {
  @ApiProperty({
    description: 'Wallet Address of User',
    example: '0x733739e3bf941Faaa05bDdc29602761ab57d38bE',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  readonly wallet_address: string

  @ApiProperty({
    description: 'Minimum balance of the wallet address',
    example: '999.2389',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  readonly min_balance: string
}

export class UpdateRanksDto {
  @ApiProperty({
    description: 'Array of wallet values',
    type: [WalletBalance],
  })
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WalletBalance)
  readonly values: WalletBalance[]

  @ApiProperty({
    description: 'Timestamp used in signature',
    example: '1734685102985',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  readonly timestamp: number
}
