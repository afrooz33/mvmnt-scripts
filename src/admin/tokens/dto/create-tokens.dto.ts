import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty } from 'class-validator'

export class CreateTokensDto {
  @ApiProperty({
    description: 'Chain ID',
    example: 1,
  })
  @IsDefined()
  @IsNotEmpty()
  chain_id: number

  @ApiProperty({
    description: 'Token address',
    example: '0x0000000000000000000000000000000000000000',
  })
  @IsDefined()
  @IsNotEmpty()
  address: string

  @ApiProperty({
    description: 'Token name',
    example: 'Token',
  })
  @IsDefined()
  @IsNotEmpty()
  name: string

  @ApiProperty({
    description: 'Token logo URI',
    example: 'https://example.com/logo.png',
  })
  @IsDefined()
  @IsNotEmpty()
  logo_uri: string

  @ApiProperty({
    description: 'Token decimals',
    example: 18,
  })
  @IsDefined()
  @IsNotEmpty()
  decimals: number

  @ApiProperty({
    description: 'Coin market cap ID',
    example: 1,
  })
  @IsDefined()
  @IsNotEmpty()
  coin_market_cap_id: number

  @ApiProperty({
    description: 'Is whitelisted',
    example: true,
  })
  @IsDefined()
  @IsNotEmpty()
  is_whitelisted: boolean
}
