import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsOptional } from 'class-validator'
import { BrandTokenRequestStatus } from '@app/src/brand-tokens/enums'

export class FiltersProperty {
  @ApiPropertyOptional({
    name: 'filter[status]',
    description: 'Filter by request status',
    enum: Object.values(BrandTokenRequestStatus),
  })
  @IsOptional()
  @IsEnum(BrandTokenRequestStatus)
  readonly status?: BrandTokenRequestStatus
}
