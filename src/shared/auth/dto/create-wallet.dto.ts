import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateWalletDto {
  @ApiProperty({
    description: 'Auth Proof signed by the user eth lib',
  })
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  readonly message: string

  @ApiProperty({
    description: 'Signature signed by the user eth lib',
  })
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  readonly signature: string

  @ApiProperty({
    description: 'Public Key from Web3Auth',
  })
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  readonly pub_key: string

  @ApiProperty({
    description: 'Smart Account from Biconomy',
  })
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  readonly smart_account: string

  @ApiProperty({
    description: 'Smart Account address from Biconomy',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  readonly wallet_address?: string
}
