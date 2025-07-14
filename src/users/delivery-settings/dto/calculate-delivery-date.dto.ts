import { IANAZone } from 'luxon'
import {
  IsUUID,
  Validate,
  IsOptional,
  IsNotEmpty,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

@ValidatorConstraint({ name: 'timeZoneValidator', async: false })
class TimeZoneValidator implements ValidatorConstraintInterface {
  validate(zone: string) {
    return IANAZone.isValidZone(zone)
  }
  defaultMessage() {
    return 'Invalid time zone'
  }
}

export class CalculateDeliveryDateDto {
  @ApiProperty({
    description: 'Variant id',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  readonly variant: string

  @ApiPropertyOptional({
    description: 'User time zone',
    example: 'America/Los_Angeles',
  })
  @IsOptional()
  @Validate(TimeZoneValidator)
  readonly timezone?: string
}
