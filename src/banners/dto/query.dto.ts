import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsNotEmpty, IsString, IsEnum } from 'class-validator'
import { BannerSection } from '@app/src/admin/banners/enums'

export class QueryDto {
  @ApiPropertyOptional({
    description: 'Page',
    default: 1,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly page?: string

  @ApiPropertyOptional({
    description: 'Results per page',
    default: 10,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly limit?: string

  @ApiPropertyOptional({
    description: 'Banner section',
    enum: Object.values(BannerSection),
  })
  @IsOptional()
  @IsEnum(BannerSection)
  readonly section?: BannerSection
}
