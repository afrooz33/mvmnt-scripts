import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty, IsUUID, ValidateIf } from 'class-validator'

export class ShopifyOrderDto {
  @ApiProperty({
    description: 'The shop where the order was made',
  })
  @IsDefined()
  @IsNotEmpty()
  readonly shop: string

  @ApiProperty({
    description: 'The current status of the order',
  })
  @IsDefined()
  @IsNotEmpty()
  readonly status: string

  @ApiProperty({
    description: 'The unique ID of the order',
  })
  @IsDefined()
  @IsNotEmpty()
  readonly order_id: string

  @ApiProperty({
    description: 'The ID of the product in the order',
  })
  @IsDefined()
  @IsNotEmpty()
  readonly product: string

  @ApiProperty({
    description: 'The variant ID of the product in the order',
  })
  @IsDefined()
  @IsNotEmpty()
  readonly variant: string

  @ApiProperty({
    description: 'The currency used for the order',
  })
  @IsDefined()
  @IsNotEmpty()
  readonly currency: string

  @ApiProperty({
    description: 'The total quantity of items in the order',
  })
  @IsDefined()
  @IsNotEmpty()
  readonly total_quantity: number

  @ApiProperty({
    description: 'The total amount of the order',
  })
  @IsDefined()
  @IsNotEmpty()
  readonly total_amount: number

  @ApiProperty({
    description: 'The email address associated with the order',
  })
  @IsDefined()
  @IsNotEmpty()
  readonly email: string

  @ApiProperty({
    description: 'The donation project associated with the order',
  })
  @IsUUID()
  @IsDefined()
  @IsNotEmpty()
  @ValidateIf((o) => !o.nonprofit)
  readonly donation_project?: string

  @ApiProperty({
    description: 'The nonprofit organization associated with the order',
  })
  @IsUUID()
  @IsDefined()
  @IsNotEmpty()
  @ValidateIf((o) => !o.donation_project)
  readonly nonprofit: string
}
