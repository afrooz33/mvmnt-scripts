import { IsOptional } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { DateFilterProperty } from './properties'

export class MvmntDonationQueryDto {
  @ApiPropertyOptional({
    type: DateFilterProperty,
    description: 'Date range',
  })
  @IsOptional()
  readonly date_filter?: DateFilterProperty
}
