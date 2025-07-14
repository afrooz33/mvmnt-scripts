import { Type } from 'class-transformer'
import { IsOptional } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { MySearchDto } from '@app/src/shared/base'
import { BankAccountSearchFields } from '@app/src/shared/enums'
import { FilterStatusProperty } from './properties'

export class QueryDto extends MySearchDto {
  constructor() {
    super(BankAccountSearchFields)
  }

  @ApiPropertyOptional({ type: FilterStatusProperty })
  @Type(() => FilterStatusProperty)
  @IsOptional()
  readonly filter?: FilterStatusProperty
}
