import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsDefined, IsEnum, IsNotEmpty, IsOptional } from 'class-validator'
import { MyPaginateDto } from '@app/src/shared/base'
import { StarType } from '@app/src/users/stars/enums'

export class StarEarningHistoryDto extends MyPaginateDto {
  @ApiProperty({
    type: 'enum',
    enum: Object.values(StarType),
  })
  @IsDefined()
  @IsNotEmpty()
  @IsEnum(StarType)
  readonly type: StarType

  @ApiPropertyOptional({
    description: 'Filter by month (MM)',
  })
  @IsOptional()
  @IsNotEmpty()
  readonly month?: string

  @ApiPropertyOptional({
    description: 'Filter by year (YYYY)',
  })
  @IsOptional()
  @IsNotEmpty()
  readonly year?: string
}
