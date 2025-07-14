import { FilterStatus, FilterAccountStatus } from '@app/src/admin/nonprofit/enums'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsOptional } from 'class-validator'

export class FilterProperty {
  @ApiPropertyOptional({
    name: 'filter[status]',
    description: 'Filter by profile status',
    enum: Object.values(FilterStatus),
  })
  @IsOptional()
  @IsEnum(FilterStatus)
  profile_status: FilterStatus

  @ApiPropertyOptional({
    name: 'filter[user][account_status]',
    description: 'Filter by account status',
    enum: Object.values(FilterAccountStatus),
  })
  @IsOptional()
  @IsEnum(FilterAccountStatus)
  account_status: FilterAccountStatus
}
