import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty, IsString } from 'class-validator'

export class InitiateWithdrawalRequestDto {
  @ApiProperty({
    description: 'Address of the payment currency',
    example: '0xfeeC6DaC9595dD9B4C54E0a7203499009d6cbfF8',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  readonly currency: string

  @ApiProperty({
    description: 'Amount to Withdraw',
    example: '4.505',
  })
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  readonly amount: string
}
