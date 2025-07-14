import { Type } from 'class-transformer'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { ArrayMaxSize, IsArray, IsEnum, IsOptional } from 'class-validator'
import { MySearchDto } from '@app/src/shared/base'
import { OnlyNameSearchFields } from '@app/src/shared/enums'
import { IsBrandAvailable } from '@app/src/shared/decorators'
import { BrandEntity } from '@app/src/admin/brands/entities/brand.entity'
import { IncludesQuery } from '@app/src/users/deal/enums/includes-query.enum'
import { DealCategoryEntity } from '@app/src/admin/deals/category/entities/deal-category.entity'
import { FiltersProperty } from './properties'

export class QueryDto extends MySearchDto {
  constructor() {
    super(OnlyNameSearchFields)
  }

  @IsOptional()
  readonly includeIds?: string[]

  @ApiPropertyOptional({ type: FiltersProperty })
  @Type(() => FiltersProperty)
  @IsOptional()
  readonly filter?: FiltersProperty

  @ApiPropertyOptional({
    name: 'includeIds[brand][]',
    description: 'Brand',
    isArray: true,
  })
  @IsArray()
  @IsOptional()
  @ArrayMaxSize(5)
  @IsBrandAvailable({
    message: 'Invalid brand',
  })
  readonly brand?: BrandEntity[]

  @ApiPropertyOptional({
    name: 'includeIds[category][]',
    description: 'Category',
    isArray: true,
  })
  @IsArray()
  @IsOptional()
  @ArrayMaxSize(5)
  readonly category?: DealCategoryEntity[]

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
}
