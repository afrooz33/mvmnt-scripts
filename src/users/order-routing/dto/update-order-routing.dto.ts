import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsUUID } from 'class-validator'
import { CreateOrderRoutingDto } from './create-order-routing.dto'

export class UpdateOrderRoutingDto extends CreateOrderRoutingDto {
  @ApiProperty({
    description: 'Id',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  readonly id: string
}
