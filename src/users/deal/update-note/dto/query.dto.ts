import { Type } from 'class-transformer'
import { IsOptional } from 'class-validator'
import { MySearchDto } from '@app/src/shared/base'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { FiltersProperty } from './properties'

export class QueryDto extends MySearchDto {
  @ApiPropertyOptional({ type: FiltersProperty })
  @Type(() => FiltersProperty)
  @IsOptional()
  readonly filter?: FiltersProperty
}
