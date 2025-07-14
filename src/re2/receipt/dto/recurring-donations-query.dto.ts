import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsDefined, IsEnum, IsNotEmpty, IsOptional } from 'class-validator'
import { MySearchDto } from '@app/src/shared/base'
import { SourceFilter } from '@app/src/re2/analytics/enums'
import { RecurringDonationStatus } from '@app/src/re2/receipt/enums'
import { StartDateRange, EndDateRange } from '@app/src/admin/deals/dto/properties'

export class RecurringDonationsQueryDto extends MySearchDto {
  @ApiProperty({
    description: 'Export the data',
    enum: ['Yes', 'No'],
    default: 'No',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsEnum(['Yes', 'No'])
  readonly export: 'Yes' | 'No'

  @ApiPropertyOptional({
    type: StartDateRange,
    description: 'Start date',
    name: 'start_date',
  })
  @IsOptional()
  readonly start_date?: StartDateRange

  @ApiPropertyOptional({
    description: 'End date',
    type: EndDateRange,
    name: 'end_date',
  })
  @IsOptional()
  readonly end_date?: EndDateRange

  @ApiPropertyOptional({
    description: 'Re2 source type',
    enum: [SourceFilter.FORM, SourceFilter.PAGE],
  })
  @IsOptional()
  @IsEnum(SourceFilter)
  readonly source_filter?: SourceFilter

  @ApiPropertyOptional({
    description: 'Recurring donation status',
    enum: Object.values(RecurringDonationStatus),
  })
  @IsOptional()
  @IsEnum(RecurringDonationStatus)
  readonly status?: RecurringDonationStatus
}
