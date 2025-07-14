import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty, ValidateIf, ValidateNested } from 'class-validator'
import {
  DeliveryDateRange,
  DeliveryDaysRange,
} from '@app/src/users/delivery-settings/dto/properties'

export class CreateProductTagDto {
  @ApiProperty({ example: 'tag1', description: 'Product tag name' })
  @IsDefined()
  @IsNotEmpty()
  readonly name: string

  @ApiProperty({
    type: DeliveryDaysRange,
    example: {
      earliest: 1,
      latest: 2,
    },
    description: 'Earliest and latest days range',
  })
  @IsDefined()
  @IsNotEmpty()
  @ValidateNested()
  @ValidateIf((o) => !o.date_range)
  @Type(() => DeliveryDaysRange)
  readonly days_range?: DeliveryDaysRange

  @ApiProperty({
    type: DeliveryDaysRange,
    example: {
      earliest: '2022-01-01',
      latest: '2022-01-02',
    },
    description: 'Earliest and latest date range',
  })
  @IsDefined()
  @IsNotEmpty()
  @ValidateNested()
  @ValidateIf((o) => !o.days_range)
  @Type(() => DeliveryDateRange)
  readonly date_range?: DeliveryDateRange
}
