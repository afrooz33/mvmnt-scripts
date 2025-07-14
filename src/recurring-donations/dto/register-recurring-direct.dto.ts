import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty, IsString, IsUUID } from 'class-validator'

export class RegisterRecurringDonationDirectDto {
  @ApiProperty({
    description: 'Donation Project ID',
    example: '86840c31-1d66-4707-9113-db00298b75dc',
    format: 'uuid',
  })
  @IsDefined()
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  readonly donation_project: string

  @ApiProperty({
    description: 'Amount for Recurring Donation',
    example: '5.5',
  })
  @IsNotEmpty()
  @IsDefined()
  @IsString()
  readonly amount: string

  @ApiProperty({
    description: 'Address of the payment currency',
    example: '0xfeeC6DaC9595dD9B4C54E0a7203499009d6cbfF8',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  readonly currency: string

  @ApiProperty({
    description: 'ID of the payment method being used',
    format: 'uuid',
    example: 'd2979a21-a823-4d92-9ed7-3c6fc5b20868',
  })
  @IsDefined()
  @IsString()
  @IsUUID()
  readonly payment_method: string
}
