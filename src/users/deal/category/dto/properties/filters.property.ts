import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsOptional, IsUUID } from 'class-validator'
import { DealCategoryType } from '@app/src/admin/deals/category/enums'

export class FiltersProperty {
  @ApiPropertyOptional({
    name: 'filter[parent]',
    type: 'string',
    format: 'uuid',
    default: null,
  })
  @IsUUID()
  @IsOptional()
  parent?: string

  @ApiPropertyOptional({
    name: 'filter[type]',
    description: 'Deal category type',
    enum: Object.values(DealCategoryType),
  })
  @IsOptional()
  @IsEnum(DealCategoryType, { each: true })
  readonly type?: DealCategoryType
}
