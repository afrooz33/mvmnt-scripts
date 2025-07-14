import { IsOptional } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { DeliverySettingStatus } from '@app/src/users/delivery-settings/enums'

export class FiltersProperty {
  @ApiPropertyOptional({
    name: 'filter[status]',
    description: 'Filter by status',
    enum: [DeliverySettingStatus.ENABLED, DeliverySettingStatus.DISABLED],
  })
  @IsOptional()
  readonly status?: string
}
