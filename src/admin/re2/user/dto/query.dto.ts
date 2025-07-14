import { Transform } from 'class-transformer'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsOptional } from 'class-validator'
import { MySearchDto } from '@app/src/shared/base'

export class QueryDto extends MySearchDto {
  @ApiPropertyOptional({
    description: 'At least one fundraiser created by user',
    type: Boolean,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  readonly fundraiser_created?: boolean

  @ApiPropertyOptional({
    description: 'At least one integration created by user',
    type: Boolean,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  readonly integration_created?: boolean

  @ApiPropertyOptional({
    description: 'Total donation start range',
    type: String,
    default: 0,
  })
  @IsOptional()
  readonly total_donation_start?: string

  @ApiPropertyOptional({
    description: 'Total donation end range',
    type: String,
    default: 0,
  })
  @IsOptional()
  readonly total_donation_end?: string
}
