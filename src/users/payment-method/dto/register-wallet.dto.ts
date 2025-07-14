import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty, IsString } from 'class-validator'

export class RegisterWalletDto {
  @ApiProperty({
    description: 'Wallet address of the User',
    example: '0x733739e3bf941Faaa05bDdc29602761ab57d38bE',
  })
  @IsString()
  @IsNotEmpty()
  @IsDefined()
  readonly address: string
}
