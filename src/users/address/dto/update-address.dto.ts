import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty, IsUUID } from 'class-validator'
import { CreateAddressDto } from './create-address.dto'

export class UpdateAddressDto extends CreateAddressDto {
  @ApiProperty({
    description: 'Address ID',
    required: true,
    format: 'uuid',
  })
  @IsUUID()
  @IsDefined()
  @IsNotEmpty()
  readonly id: string
}
