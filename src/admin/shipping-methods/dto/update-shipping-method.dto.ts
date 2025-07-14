import { IsDefined, IsNotEmpty } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { CreateShippingMethodDto } from './create-shipping-method.dto'

export class UpdateShippingMethodDto extends CreateShippingMethodDto {
  @ApiProperty({ format: 'uuid' })
  @IsNotEmpty()
  @IsDefined()
  readonly id: string
}
