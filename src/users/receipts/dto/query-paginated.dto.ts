import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator'
import { MyPaginateDto } from '@app/src/shared/base'

export class QueryPaginatedDto extends MyPaginateDto {
  @ApiProperty({
    description: 'Is history (pass as "Yes" or "No")',
    type: 'string',
    example: 'Yes',
    enum: ['Yes', 'No'],
  })
  @IsNotEmpty()
  @IsEnum(['Yes', 'No'])
  readonly is_history: string

  @ApiPropertyOptional({
    description: 'Nonprofit id',
    format: 'uuid',
  })
  @IsUUID()
  @IsOptional()
  readonly nonprofit?: string

  @ApiPropertyOptional({
    description: 'Source id',
    format: 'uuid',
  })
  @IsUUID()
  @IsOptional()
  readonly source_id?: string
}
