import { ApiProperty } from '@nestjs/swagger'
import { Min, IsDefined, IsNumber } from 'class-validator'

export class DeliveryDaysRange {
  @ApiProperty({
    type: Number,
    description: 'Earliest delivery day',
    example: 1,
  })
  @Min(0)
  @IsDefined()
  @IsNumber()
  earliest: number

  @ApiProperty({
    type: Number,
    description: 'Latest delivery day',
    example: 5,
  })
  @Min(1)
  @IsDefined()
  @IsNumber()
  latest: number
}
