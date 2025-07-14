import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator'
import { DonationType } from '@app/src/donations/enums'

export class InitiateRecurringDonationDto {
  @ApiProperty({
    description: 'Donation Project ID',
    example: '195eae0c-350a-4413-bcaf-e034a0b190b6',
    format: 'uuid',
  })
  @IsNotEmpty()
  @IsNotEmpty()
  @IsDefined()
  @IsUUID()
  readonly donation_project: string

  @ApiProperty({
    description: 'Address of the payment currency',
    example: '0xfeeC6DaC9595dD9B4C54E0a7203499009d6cbfF8',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  readonly currency: string

  @ApiProperty()
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  amount: string

  @ApiProperty({
    description: 'ID of the payment method being used',
    format: 'uuid',
    example: 'd2979a21-a823-4d92-9ed7-3c6fc5b20868',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  readonly payment_method: string

  @ApiProperty({
    description: 'ID of the Recurring Donation Signature',
    format: 'uuid',
    example: '1c85688f-0ddd-49ab-933b-9944cc7539e5',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  readonly signature: string

  @ApiProperty({
    description: 'Reason for Donation',
    enum: Object.values(DonationType),
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  @IsEnum(DonationType)
  readonly reason: DonationType
}
