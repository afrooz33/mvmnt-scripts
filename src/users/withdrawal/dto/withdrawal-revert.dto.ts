import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class RejectWithdrawalDto {
  @ApiProperty({
    description: 'Withdrawal ID from Blockchain',
    example: '0x5cc332e338f14ffa9290f51868df6fd01730966742625',
  })
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  readonly withdraw_id: string

  @ApiProperty({
    description: 'Timestamp used in signature',
    example: '1734685102985',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  readonly timestamp: number
}
