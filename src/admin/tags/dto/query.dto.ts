import { IncludesQuery } from '@app/src/admin/tags/enums'
import { MySearchDto } from '@app/src/shared/base'
import { TranslationSearchFields } from '@app/src/shared/enums'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { ArrayMinSize, IsArray, IsEnum, IsOptional } from 'class-validator'

export class QueryDto extends MySearchDto {
  constructor() {
    super(TranslationSearchFields)
  }

  @ApiPropertyOptional({
    name: 'includes[]',
    description: 'Relations',
    isArray: true,
    enum: Object.values(IncludesQuery),
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(IncludesQuery, { each: true })
  readonly includes?: IncludesQuery[]
}
