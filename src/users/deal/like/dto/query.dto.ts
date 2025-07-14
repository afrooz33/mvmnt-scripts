import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, IsNotEmpty, IsUUID, IsOptional } from 'class-validator'

export class QueryDto {
  @ApiPropertyOptional({
    description: 'Deal ID',
    format: 'uuid',
  })
  @IsUUID()
  @IsOptional()
  readonly deal?: string

  @ApiProperty({
    description: 'Page',
    default: 1,
  })
  @IsString()
  @IsNotEmpty()
  readonly page?: string

  @ApiProperty({
    description: 'Results per page',
    default: 10,
  })
  @IsString()
  @IsNotEmpty()
  readonly limit?: string
}
