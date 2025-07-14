import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsArray, IsUUID, ArrayMinSize } from 'class-validator'
import { MySearchDto } from '@app/src/shared/base'
import { NonprofitSearchFields } from '@app/src/shared/enums'
import { TagEntity } from '@app/src/admin/tags/entities/tag.entity'

export class QueryDto extends MySearchDto {
  constructor() {
    super(NonprofitSearchFields)
  }

  @IsOptional()
  readonly includeIds?: string[]

  @ApiPropertyOptional({
    name: 'includeIds[tags][]',
    description: 'Filter by tags',
    isArray: true,
    format: 'uuid',
  })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true, message: 'Invalid tags' })
  @ArrayMinSize(1)
  readonly tags?: TagEntity[]
}
