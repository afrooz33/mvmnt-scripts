import { IsOptional, IsEnum, IsArray, ArrayMinSize, IsUUID } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { MySearchDto } from '@app/src/shared/base'
import { DonationProjectSearchFields } from '@app/src/shared/enums'
import { IncludesQuery } from '@app/src/admin/donation-projects/enums'
import { TagEntity } from '@app/src/admin/tags/entities/tag.entity'
import { EndDateRange, StartDateRange, FilterProperty } from './properties'

export class DonationProjectBaseDto extends MySearchDto {
  constructor() {
    super(DonationProjectSearchFields)
  }

  @ApiPropertyOptional({ type: FilterProperty })
  @Type(() => FilterProperty)
  @IsOptional()
  readonly filter?: FilterProperty

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
    description: 'Project Start Date',
  })
  @IsOptional()
  readonly start_date?: StartDateRange

  @ApiPropertyOptional({
    type: EndDateRange,
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
  @ArrayMinSize(1)
  @IsEnum(IncludesQuery, { each: true })
  readonly includes?: IncludesQuery[]
}
