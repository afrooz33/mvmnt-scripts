import { ApiProperty } from '@nestjs/swagger'
import { IsDateString, Validate, ValidationArguments } from 'class-validator'

class EarliestBeforeLatestValidator {
  validate(value: Date, args: ValidationArguments) {
    const earliest = value
    const latest = (args.object as DeliveryDateRange).latest
    return earliest.getTime() <= latest.getTime()
  }

  defaultMessage() {
    return 'Earliest delivery date must be before or equal to the latest delivery date'
  }
}

export class DeliveryDateRange {
  @ApiProperty({
    type: String,
    description: 'Earliest delivery date',
    example: '2024-10-01',
  })
  @IsDateString()
  @Validate(EarliestBeforeLatestValidator)
  earliest: Date

  @ApiProperty({
    type: String,
    description: 'Latest delivery date',
    example: '2024-10-05',
  })
  @IsDateString()
  @Validate(EarliestBeforeLatestValidator, {
    message: (args: ValidationArguments) =>
      `Latest delivery date must be after or equal to the earliest (${
        args.object['earliest'].toISOString().split('T')[0]
      })`,
  })
  latest: Date
}
