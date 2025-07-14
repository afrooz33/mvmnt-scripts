import { IsOptional } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { DateFilterProperty } from './properties'

export class DateFilterQueryDto {
  @ApiPropertyOptional({
    type: DateFilterProperty,
    description: 'Date range',
  })
  @IsOptional()
  readonly date_filter?: DateFilterProperty

  @ApiPropertyOptional({
    description: 'Page',
    default: 1,
  })
  @IsOptional()
  readonly page?: string

  @ApiPropertyOptional({
    description: 'Results per page',
    default: 10,
  })
  @IsOptional()
  readonly limit?: string
}
