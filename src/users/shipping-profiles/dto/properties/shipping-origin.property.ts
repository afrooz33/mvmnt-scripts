import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty } from 'class-validator'

export class ShippingOriginProperty {
  @ApiProperty({
    type: 'string',
    format: 'uuid',
    description: 'Origin of the shipping profile',
  })
  @IsDefined()
  @IsNotEmpty()
  readonly id: string
}
