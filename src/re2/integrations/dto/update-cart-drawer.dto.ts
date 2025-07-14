import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty, IsUUID } from 'class-validator'
import { CreateCartDrawerDto } from './create-cart-drawer.dto'

export class UpdateCartDrawerDto extends CreateCartDrawerDto {
  @ApiProperty({
    description: 'Shopify integration cart drawer settings id',
    type: 'string',
    format: 'uuid',
    example: '98f1dc3d-695a-48ba-abb8-0dee64d90321',
  })
  @IsUUID()
  @IsDefined()
  @IsNotEmpty()
  readonly id: string
}
