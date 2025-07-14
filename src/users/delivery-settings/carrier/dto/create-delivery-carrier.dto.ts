import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty, IsString } from 'class-validator'

export class CreateDeliveryCarrierDto {
  @ApiProperty({
    description: 'Carrier name',
    example: 'Fedex',
  })
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  readonly name: string

  @ApiProperty({
    description: 'Carrier time slots',
    isArray: true,
    example: ['Morning (10:00 - 12:00)', 'Evening (14:00 - 16:00)'],
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString({ each: true })
  readonly time_slot: string
}
