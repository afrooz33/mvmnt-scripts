import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsOptional, IsUUID } from 'class-validator'
import { CartStatus } from '@app/src/users/deal/buynow/enums'

export class FiltersProperty {
  @ApiPropertyOptional({
    name: 'filter[id]',
    description: 'Filter by id',
    format: 'uuid',
  })
  @IsUUID()
  @IsOptional()
  readonly id?: string

  @ApiPropertyOptional({
    name: 'filter[status]',
    description: 'Filter by status',
    enum: Object.values(CartStatus),
    default: CartStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(CartStatus)
  readonly status?: CartStatus
}
