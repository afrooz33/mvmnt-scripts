import { IsEnum, IsOptional } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { DealType } from '@app/src/users/deal/enums'
import { DealAdminStatusFilter } from '@app/src/admin/deals/enums'

export class FiltersProperty {
  @ApiPropertyOptional({
    name: 'filter[status]',
    description: 'Filter by status',
    enum: Object.values(DealAdminStatusFilter),
  })
  @IsOptional()
  @IsEnum(DealAdminStatusFilter)
  readonly status?: DealAdminStatusFilter

  @ApiPropertyOptional({
    name: 'filter[deal_type]',
    description: 'Deal type',
    enum: Object.values(DealType),
  })
  @IsOptional()
  @IsEnum(DealType)
  readonly deal_type?: DealType
}
