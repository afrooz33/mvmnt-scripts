import { Type } from 'class-transformer'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsArray, ArrayMaxSize, IsEnum } from 'class-validator'
import { MySearchDto } from '@app/src/shared/base'
import { IncludesQuery } from '@app/src/users/address/enums'
import { UserAddressSearchFields } from '@app/src/shared/enums'
import { FiltersProperty } from './properties'

export class QueryDto extends MySearchDto {
  constructor() {
    super(UserAddressSearchFields)
  }

  @ApiPropertyOptional({
    name: 'includes[]',
    description: 'Relations',
    isArray: true,
    enum: Object.values(IncludesQuery),
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(3)
  @IsEnum(IncludesQuery, { each: true })
  readonly includes?: IncludesQuery[]

  @ApiPropertyOptional({ type: FiltersProperty })
  @Type(() => FiltersProperty)
  @IsOptional()
  readonly filter?: FiltersProperty
}
