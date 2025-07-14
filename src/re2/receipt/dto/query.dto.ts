import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsDefined, IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator'
import { MySearchDto } from '@app/src/shared/base'
import { SourceFilter } from '@app/src/re2/analytics/enums'
import { DateFilterProperty } from '@app/src/admin/analytics/dto/properties'
import { TotalDonation } from '@app/src/nonprofit/donation-projects/dto/properties'
import { GrossDonationRangeProperty } from '@app/src/admin/donation-projects/dto/properties'

export class QueryDto extends MySearchDto {
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
    type: DateFilterProperty,
    description: 'Date range',
  })
  @IsOptional()
  readonly date_filter?: DateFilterProperty

  @ApiPropertyOptional({
    type: GrossDonationRangeProperty,
    description: 'Gross donation range',
  })
  @IsOptional()
  readonly gross_donation?: GrossDonationRangeProperty

  @ApiPropertyOptional({
    type: TotalDonation,
    description: 'Total donation range',
  })
  @IsOptional()
  readonly total_donation?: TotalDonation

  @ApiPropertyOptional({
    description: 'Re2 source type',
    enum: Object.values(SourceFilter),
  })
  @IsOptional()
  @IsEnum(SourceFilter)
  readonly source_filter?: SourceFilter

  @ApiPropertyOptional({
    description: 'Re2 source id',
    format: 'uuid',
  })
  @IsUUID()
  @IsOptional()
  readonly source_id?: string
}
