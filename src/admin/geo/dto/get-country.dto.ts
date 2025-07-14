import { Type } from 'class-transformer'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { ArrayMinSize, IsArray, IsEnum, IsOptional } from 'class-validator'
import { MySearchDto } from '@app/src/shared/base'
import { TranslationSearchFields } from '@app/src/shared/enums'
import { IncludesQuery } from '@app/src/admin/geo/enums'
import { FiltersProperty } from './properties'

export class GetCountryDto extends MySearchDto {
  constructor() {
    super(TranslationSearchFields)
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
