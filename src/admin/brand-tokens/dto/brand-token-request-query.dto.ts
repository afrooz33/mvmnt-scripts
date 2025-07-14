import { IsOptional } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { MySearchDto } from '@app/src/shared/base/dto/my.search.dto'
import { FiltersProperty, DateRange } from './properties'

export class BrandTokenRequestQueryDto extends MySearchDto {
  constructor() {
    super({
      'brand_token.name': 'Brand token name',
      'user.email': 'User email',
    })
  }

  @ApiPropertyOptional({ type: FiltersProperty })
  @Type(() => FiltersProperty)
  @IsOptional()
  readonly filter?: FiltersProperty

  @ApiPropertyOptional({ description: 'Filter by created date range' })
  @IsOptional()
  readonly created_date?: DateRange
}
