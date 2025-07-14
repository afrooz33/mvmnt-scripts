import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsArray, IsEnum, IsOptional } from 'class-validator'
import { MySearchDto } from '@app/src/shared/base'
import { OnlyNameSearchFields } from '@app/src/shared/enums'
import { DealStatus } from '@app/src/users/deal/enums'

export class QueryDto extends MySearchDto {
  constructor() {
    super(OnlyNameSearchFields)
  }

  @ApiPropertyOptional({
    name: 'status[]',
    description: 'Deal status',
    isArray: true,
    enum: Object.values(DealStatus),
  })
  @IsArray()
  @IsOptional()
  @IsEnum(DealStatus, { each: true })
  readonly status?: DealStatus[]
}
