import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsOptional, ValidateIf } from 'class-validator'
import { AllowedStatus } from '@app/src/admin/shipping-methods/enums'

export class FilterStatusProperty {
  @ApiPropertyOptional({
    name: 'filter[status]',
    description: 'Filter',
    enum: Object.values(AllowedStatus),
    default: AllowedStatus.ENABLED,
  })
  @IsOptional()
  @IsEnum(AllowedStatus)
  @ValidateIf((o) => o.status !== undefined)
  readonly status?: AllowedStatus
}
