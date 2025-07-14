import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty, IsUUID, ValidateNested } from 'class-validator'
import { DeliveryDaysRange } from './properties'

export class CreateDeliverySettingDto {
  @ApiProperty({
    type: DeliveryDaysRange,
    example: {
      earliest: 1,
      latest: 2,
    },
    description: 'Earliest and latest delivery days range',
  })
  @IsDefined()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => DeliveryDaysRange)
  readonly delivery_days_range: DeliveryDaysRange

  @ApiProperty({
    type: String,
    example: '10:00',
    description: 'Order cut off time',
  })
  @IsDefined()
  @IsNotEmpty()
  readonly order_cut_off_time: string

  @ApiProperty({
    type: [String],
    example: ['Monday', 'Tuesday'],
    description: 'Non working days',
  })
  @IsDefined()
  @IsNotEmpty()
  readonly non_working_days: string[]

  @ApiProperty({
    type: [String],
    example: ['2022-01-01', '2022-01-02'],
    description: 'Holidays',
  })
  @IsDefined()
  @IsNotEmpty()
  readonly holidays: string[]

  @ApiProperty({
    description: 'Delivery carrier',
    format: 'uuid',
    example: '3a69e4cf-acec-45f1-aa50-bcece09f4944',
  })
  @IsUUID()
  @IsDefined()
  @IsNotEmpty()
  readonly carrier: string
}
