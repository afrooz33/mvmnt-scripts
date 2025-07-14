import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsDefined, IsEnum, IsNotEmpty, IsOptional } from 'class-validator'
import { MySearchDto } from '@app/src/shared/base'
import { ContributorSourceFilter } from '@app/src/re2/analytics/enums'
import { DateFilterProperty } from '@app/src/admin/analytics/dto/properties'
import { GrossDonationRangeProperty } from '@app/src/admin/donation-projects/dto/properties'

export class Re2ContributorQueryDto extends MySearchDto {
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
    description: 'Re2 source type',
    enum: Object.values(ContributorSourceFilter),
  })
  @IsOptional()
  @IsEnum(ContributorSourceFilter)
  readonly source_filter?: ContributorSourceFilter
}
