import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, IsNotEmpty } from 'class-validator'

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
}
