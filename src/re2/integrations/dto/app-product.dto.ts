import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsString, IsDefined, IsNotEmpty, IsOptional } from 'class-validator'

export class AppProductDto {
  @ApiPropertyOptional({
    description: 'Search by keyword',
  })
  @IsString()
  @IsOptional()
  readonly keyword?: string

  @ApiPropertyOptional({
    description: 'Search by ids',
    example: ['7611059634428'],
    isArray: true,
  })
  @IsOptional()
  readonly id?: string[]

  @ApiPropertyOptional({
    description: 'Pagination relation',
    enum: ['next', 'previous'],
  })
  @IsEnum(['next', 'previous'])
  @IsString()
  @IsOptional()
  readonly rel?: string

  @ApiPropertyOptional({
    description: 'Cursor for pagination',
  })
  @IsString()
  @IsOptional()
  readonly cursor?: string

  @ApiProperty({
    description: 'Results per page',
    default: 10,
  })
  @IsDefined()
  @IsNotEmpty()
  readonly limit?: string
}
