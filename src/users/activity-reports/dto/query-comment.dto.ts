import { MySearchDto } from '@app/src/shared/base'
import { IsOptional, IsUUID } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class QueryCommentDto extends MySearchDto {
  @ApiPropertyOptional({
    description: 'User Id',
    format: 'uuid',
  })
  @IsUUID()
  @IsOptional()
  readonly user?: string
}
