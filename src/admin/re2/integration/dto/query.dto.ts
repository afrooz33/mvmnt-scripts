import { IsOptional, IsUUID } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { MySearchDto } from '@app/src/shared/base'

export class QueryDto extends MySearchDto {
  @ApiPropertyOptional({
    description: 'Filter by re2 user id',
    format: 'uuid',
  })
  @IsUUID()
  @IsOptional()
  readonly user?: string
}
