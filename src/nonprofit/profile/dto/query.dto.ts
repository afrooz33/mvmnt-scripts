import { ApiPropertyOptional } from '@nestjs/swagger'

import { ArrayMinSize, IsArray, IsEnum, IsOptional } from 'class-validator'

import { IncludesQuery } from '@app/src/nonprofit/profile/enums'

export class QueryDto {
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
