import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator'

export class RegisterRecurringDonationDealDto {
  @ApiProperty({
    description: 'Deal ID',
    example: '195eae0c-350a-4413-bcaf-e034a0b190b6',
    format: 'uuid',
  })
  @IsNotEmpty()
  @IsDefined()
  @IsString()
  @IsUUID()
  readonly deal: string

  @ApiProperty({
    description: 'Address of the payment currency',
    example: '0xfeeC6DaC9595dD9B4C54E0a7203499009d6cbfF8',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  readonly currency: string

  @ApiProperty({
    description: 'Quantity of products bought',
    example: '5',
    format: 'int',
  })
  @IsDefined()
  @IsNumber()
  @IsNotEmpty()
  quantity: number

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
