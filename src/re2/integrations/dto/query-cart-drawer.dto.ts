import { Type } from 'class-transformer'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, ValidateNested } from 'class-validator'
import { MySearchDto } from '@app/src/shared/base'
import { FiltersProperty } from './properties'

export class QueryCartDrawerDto extends MySearchDto {
  @ApiPropertyOptional({ type: FiltersProperty })
  @Type(() => FiltersProperty)
  @IsOptional()
  @ValidateNested()
  readonly filter?: FiltersProperty
}
