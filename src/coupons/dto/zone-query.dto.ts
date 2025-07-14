import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsAlphanumeric, IsOptional, IsString } from 'class-validator'

export class ZoneQueryDto {
  @ApiPropertyOptional({
    description: 'Keyword to search for zones',
    required: false,
  })
  @IsString()
  @IsOptional()
  @IsAlphanumeric()
  readonly keyword: string
}
