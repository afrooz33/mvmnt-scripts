import { Transform } from 'class-transformer'
import { ArrayMaxSize, IsArray, IsEnum, IsOptional } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { MySearchDto } from '@app/src/shared/base'
import { TranslationSearchFields } from '@app/src/shared/enums'
import { IncludesQuery } from '@app/src/admin/tags/enums'

export class QueryDto extends MySearchDto {
  constructor() {
    super(TranslationSearchFields)
  }

  @ApiPropertyOptional({
    name: 'includes[]',
    description: 'Relations',
    isArray: true,
    enum: Object.values(IncludesQuery),
    nullable: true,
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsEnum(IncludesQuery, { each: true })
  readonly includes?: IncludesQuery[]

  @ApiPropertyOptional({
    description: 'Nonprofit availability',
    type: Boolean,
    default: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true', { toClassOnly: true })
  readonly has_nonprofit?: boolean

  @ApiPropertyOptional({
    description: 'Donation project availability',
    type: Boolean,
    default: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true', { toClassOnly: true })
  readonly has_donation_project?: boolean
}
