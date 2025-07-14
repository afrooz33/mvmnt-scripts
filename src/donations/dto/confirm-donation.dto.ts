import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class ConfirmDonationDto {
  @ApiProperty({
    description: 'Payment ID from Blockchain',
    example: '0x5cc332e338f14ffa9290f51868df6fd01730966742625',
  })
  @IsNotEmpty()
  @IsString()
  @IsDefined()
  readonly payment_id: string

  @ApiProperty({
    description: 'Transaction Hash for Payment',
    example: '0x022a8da8c28183992ddfda1b4678934bfe023138433f970e01fee466f6219db0',
  })
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  readonly transaction_hash: string

  @ApiProperty({
    description: 'Unsettled amount',
  })
  @IsNotEmpty()
  @IsDefined()
  @IsString()
  unsettled_amount: string

  @ApiProperty({
    description: '1 = Deal Donation. 2 = Direct Donation. 3 = Recurring Donation',
  })
  @IsNotEmpty()
  @IsDefined()
  @IsNumber()
  type: number

  @ApiProperty({
    description: 'Timestamp used in signature',
    example: '1734685102985',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  readonly timestamp: number
}
