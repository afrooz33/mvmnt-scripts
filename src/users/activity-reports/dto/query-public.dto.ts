import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, IsOptional, IsNotEmpty, IsUUID, IsEnum } from 'class-validator'
import { FilterSection } from '@app/src/users/activity-reports/enums'

export class QueryPublicDto {
  @ApiPropertyOptional({
    description: 'Search by keyword',
  })
  @IsString()
  @IsOptional()
  readonly keyword?: string

  @ApiProperty({
    description: 'Search section',
    enum: Object.values(FilterSection),
  })
  @IsNotEmpty()
  @IsEnum(FilterSection)
  readonly section: FilterSection

  @ApiPropertyOptional({
    description: 'Search by nonprofit user',
    format: 'uuid',
  })
  @IsUUID()
  @IsOptional()
  readonly nonprofit_user?: string

  @ApiPropertyOptional({
    description: 'Page',
    default: 1,
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  readonly page?: string

  @ApiPropertyOptional({
    description: 'Results per page',
    default: 10,
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  readonly limit?: string
}
