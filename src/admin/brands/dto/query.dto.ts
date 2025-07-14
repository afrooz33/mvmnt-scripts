import { IsOptional, IsArray, ArrayMinSize, IsEnum } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { MySearchDto } from '@app/src/shared/base'
import { IncludesQuery } from '@app/src/admin/brands/enums'
import { TranslationSearchFields } from '@app/src/shared/enums'

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
