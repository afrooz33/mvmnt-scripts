import { Transform } from 'class-transformer'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { Max, Min, IsOptional, ValidateIf, IsNotEmpty } from 'class-validator'
import { MyPaginateDto } from '@app/src/shared/base'

export class QueryDto extends MyPaginateDto {
  @ApiPropertyOptional({
    description: 'Donation year (YYYY format, must not be greater than current year)',
  })
  @IsOptional()
  @IsNotEmpty()
  @ValidateIf((o) => o.year !== undefined)
  @Transform(({ value }) => {
    if (!value) return value
    const year = Number.parseInt(value, 10)
    if (isNaN(year)) return value
    return year
  })
  @Max(new Date().getFullYear(), {
    message: 'Year cannot be greater than current year',
  })
  @Min(2022, {
    message: 'Year must be greater than or equal to 2022',
  })
  readonly year?: string

  @ApiPropertyOptional({
    description: 'Source ids',
    isArray: true,
  })
  @IsOptional()
  @IsNotEmpty()
  @ValidateIf((o) => o.source_ids !== undefined)
  readonly source_ids?: string[]
}
