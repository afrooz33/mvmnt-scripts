import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsDefined, IsEnum, IsNotEmpty, IsOptional } from 'class-validator'
import { MyPaginateDto } from '@app/src/shared/base'
import { SourceFilter } from '@app/src/re2/analytics/enums'
import { DateFilterProperty } from '@app/src/admin/analytics/dto/properties'

export class Re2AnalyticQueryDto extends MyPaginateDto {
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
    description: 'Re2 source type',
    enum: Object.values(SourceFilter),
  })
  @IsOptional()
  @IsEnum(SourceFilter)
  readonly source_filter?: SourceFilter
}
