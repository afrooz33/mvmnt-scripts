import { ApiProperty } from '@nestjs/swagger'
import { IsUUID, IsNotEmpty, IsDefined, IsDateString, ArrayMinSize } from 'class-validator'

export class UpdateCartDeliveryDto {
  @ApiProperty({
    description: 'Cart id',
    format: 'uuid',
    example: '85d89096-29bd-4c24-be50-8bfab1fa205a',
  })
  @IsUUID()
  @IsNotEmpty()
  @IsDefined()
  cart: string

  @ApiProperty({
    description: 'Cart variants',
    isArray: true,
    example: ['a8da0f23-c1f8-4de4-85da-9d535996b266'],
  })
  @IsDefined()
  @IsNotEmpty({ each: true })
  @IsUUID('4', { each: true })
  @ArrayMinSize(1)
  variants: string[]

  @ApiProperty({
    description: 'Cart variant old delivery date',
    format: 'string',
    default: '2024-09-08',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsDateString()
  old_delivery_date: string

  @ApiProperty({
    description: 'Cart variant delivery date',
    format: 'string',
    default: '2024-09-08',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsDateString()
  delivery_date: string

  @ApiProperty({
    description: 'Cart variant delivery time',
    format: 'string',
  })
  @IsDefined()
  @IsNotEmpty()
  delivery_time_slot: string
}
