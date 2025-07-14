import { IsEnum, IsOptional } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { PayloadStatus } from '@app/src/users/activity-reports/enums'

export class FiltersProperty {
  @ApiPropertyOptional({
    name: 'filter[status]',
    description: 'Activity report status',
    required: false,
    enum: Object.values(PayloadStatus),
  })
  @IsOptional()
  @IsEnum(PayloadStatus)
  readonly status?: PayloadStatus
}
