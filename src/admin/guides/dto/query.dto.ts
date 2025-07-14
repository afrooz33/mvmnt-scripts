import { ArrayMinSize, IsArray, IsEnum, IsOptional } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { MySearchDto } from '@app/src/shared/base'
import { GuidesSearchFields } from '@app/src/shared/enums'
import { IncludesQuery } from '@app/src/admin/guides/enums'
import { FiltersProperty } from './properties'

export class QueryDto extends MySearchDto {
  constructor() {
    super(GuidesSearchFields)
  }

  @ApiPropertyOptional({ type: FiltersProperty })
  @Type(() => FiltersProperty)
  @IsOptional()
  readonly filter?: FiltersProperty

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
