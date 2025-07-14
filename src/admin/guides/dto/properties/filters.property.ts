import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsOptional, IsUUID } from 'class-validator'
import { GuidesEntity } from '@app/src/admin/guides/entities/guides.entity'
import { GuideLevel } from '@app/src/admin/guides/enums'
import { HaveChild } from '@app/src/admin/deals/category/enums'

export class FiltersProperty {
  @ApiPropertyOptional({
    name: 'filter[parent]',
    type: 'string',
    format: 'uuid',
    default: null,
  })
  @IsUUID()
  @IsOptional()
  readonly parent?: GuidesEntity

  @ApiPropertyOptional({
    name: 'filter[level]',
    type: 'enum',
    default: null,
  })
  @IsEnum(GuideLevel)
  @IsOptional()
  readonly level?: GuideLevel

  @ApiPropertyOptional({
    name: 'filter[have_child]',
    enum: Object.values(HaveChild),
  })
  @IsEnum(HaveChild)
  @IsOptional()
  have_child?: HaveChild
}
