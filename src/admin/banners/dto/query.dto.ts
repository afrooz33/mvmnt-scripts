import { IsOptional, IsArray, ArrayMaxSize, IsEnum } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { MySearchDto } from '@app/src/shared/base'
import { BannerSearchFields } from '@app/src/shared/enums'
import { IncludesQuery } from '@app/src/admin/banners/enums'

export class QueryDto extends MySearchDto {
  constructor() {
    super(BannerSearchFields)
  }

  @ApiPropertyOptional({
    name: 'includes[]',
    description: 'Relations',
    isArray: true,
    enum: Object.values(IncludesQuery),
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsEnum(IncludesQuery, { each: true })
  readonly includes?: IncludesQuery[]
}
