import { Type } from 'class-transformer'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsArray, ArrayMaxSize, IsEnum, ValidateNested } from 'class-validator'
import { MySearchDto } from '@app/src/shared/base'
import { IncludesQuery } from '@app/src/users/activity-reports/enums'
import { FiltersProperty } from './properties'

export class QueryDto extends MySearchDto {
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

  @ApiPropertyOptional({ type: FiltersProperty })
  @IsOptional()
  @Type(() => FiltersProperty)
  @ValidateNested({ each: true })
  readonly filter?: FiltersProperty
}
