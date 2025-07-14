import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsOptional, IsUUID } from 'class-validator'
import { DealCategoryType, HaveChild } from '@app/src/admin/deals/category/enums'

export class FiltersProperty {
  @ApiPropertyOptional({
    name: 'filter[type]',
    enum: Object.values(DealCategoryType),
  })
  @IsEnum(DealCategoryType)
  @IsOptional()
  readonly type?: DealCategoryType

  @ApiPropertyOptional({
    name: 'filter[have_child]',
    enum: Object.values(HaveChild),
  })
  @IsEnum(HaveChild)
  @IsOptional()
  have_child?: HaveChild

  @ApiPropertyOptional({
    name: 'filter[parent]',
    type: 'string',
    format: 'uuid',
    default: null,
  })
  @IsUUID()
  @IsOptional()
  readonly parent?: string
}
