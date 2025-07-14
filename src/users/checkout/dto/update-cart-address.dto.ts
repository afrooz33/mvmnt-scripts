import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty, IsUUID } from 'class-validator'

export class UpdateCartAddressDto {
  @ApiProperty({
    description: 'Cart id',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  @IsDefined()
  cart: string

  @ApiProperty({
    description: 'Address id',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  @IsDefined()
  delivery_address: string
}
