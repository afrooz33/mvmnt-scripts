import { Type } from 'class-transformer'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { ArrayMaxSize, ArrayMinSize, IsArray, IsEnum, IsOptional, IsUUID } from 'class-validator'
import { IncludesQuery } from '@app/src/nonprofit/donation-projects/enums'
import { MySearchDto } from '@app/src/shared/base'
import { OnlyNameSearchFields } from '@app/src/shared/enums'
import { TagEntity } from '@app/src/admin/tags/entities/tag.entity'
import { EndDateRange, StartDateRange } from '@app/src/admin/donation-projects/dto/properties'
import { FiltersProperty, TotalDonation, TotalDonor } from './properties'

export class QueryDto extends MySearchDto {
  constructor() {
    super(OnlyNameSearchFields)
  }

  @ApiPropertyOptional({ type: FiltersProperty })
  @Type(() => FiltersProperty)
  @IsOptional()
  readonly filter?: FiltersProperty

  @IsOptional()
  readonly includeIds?: string[]

  /**
   * Filter by tags
   * @example tags[]=tag1&tags[]=tag2
   * @example tags[]=tag1
   *
   * Do not need max array size limit
   */
  @ApiPropertyOptional({
    name: 'includeIds[tags][]',
    description: 'Filter by tags',
    isArray: true,
    format: 'uuid',
  })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true, message: 'Invalid tags' })
  @ArrayMinSize(1)
  readonly tags?: TagEntity[]

  @ApiPropertyOptional({
    type: StartDateRange,
    name: 'start_date',
    description: 'Project Start Date',
  })
  @IsOptional()
  readonly start_date?: StartDateRange

  @ApiPropertyOptional({
    type: EndDateRange,
    name: 'end_date',
    description: 'Project End Date',
  })
  @IsOptional()
  readonly end_date?: EndDateRange

  @ApiPropertyOptional({
    name: 'includes[]',
    description: 'Relations',
    isArray: true,
    enum: Object.values(IncludesQuery),
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsEnum(IncludesQuery, { each: true })
  readonly includes?: IncludesQuery[]

  @ApiPropertyOptional({
    type: TotalDonation,
    name: 'total_donations',
    description: 'Total donations',
  })
  @IsOptional()
  readonly total_donations?: TotalDonation

  @ApiPropertyOptional({
    type: TotalDonor,
    name: 'total_donors',
    description: 'Total donors',
  })
  @IsOptional()
  readonly total_donors?: TotalDonor
}
