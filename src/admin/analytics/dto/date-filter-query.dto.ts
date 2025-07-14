import { IsOptional } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { MyPaginateDto } from '@app/src/shared/base'
import { DateFilterProperty } from './properties'

export class DateFilterQueryDto extends MyPaginateDto {
  @ApiPropertyOptional({
    type: DateFilterProperty,
    description: 'Date range',
  })
  @IsOptional()
  readonly date_filter?: DateFilterProperty
}
