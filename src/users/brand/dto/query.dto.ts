import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, Matches } from 'class-validator'

export class QueryDto {
  @ApiPropertyOptional({
    description: 'Search keyword',
    type: String,
  })
  @IsString()
  @Matches(/^[a-zA-Z0-9\s]+$/, {
    message: 'Keyword must contain only letters, numbers, and spaces.',
  })
  @IsOptional()
  readonly keyword?: string
}
