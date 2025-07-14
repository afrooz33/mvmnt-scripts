import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

export class QueryDto {
  @ApiPropertyOptional({
    description: 'Page',
    default: 1,
  })
  @IsString()
  @IsOptional()
  readonly page?: string

  @ApiPropertyOptional({
    description: 'Results per page',
    default: 10,
  })
  @IsString()
  @IsOptional()
  readonly limit?: string
}
