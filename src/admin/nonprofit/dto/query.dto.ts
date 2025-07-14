import { ArrayMaxSize, IsArray, IsEnum, IsOptional } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { FilterProperty } from '@app/src/admin/nonprofit/dto/properties'
import { MySearchDto } from '@app/src/shared/base'
import { NonprofitProfileSearchFields } from '@app/src/shared/enums'
import { IncludesQuery } from '@app/src/admin/nonprofit/enums'
import { TotalDonation } from '@app/src/nonprofit/donation-projects/dto/properties'

export class QueryDto extends MySearchDto {
  constructor() {
    super(NonprofitProfileSearchFields)
  }

  @ApiPropertyOptional({ type: FilterProperty })
  @Type(() => FilterProperty)
  @IsOptional()
  readonly filter?: FilterProperty

  @ApiPropertyOptional({
    type: TotalDonation,
    name: 'total_donations',
    description: 'Total donations',
  })
  @IsOptional()
  readonly total_donations?: TotalDonation

  @ApiPropertyOptional({
    name: 'includes[]',
    description: 'Relations',
    isArray: true,
    enum: Object.values(IncludesQuery),
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsEnum(IncludesQuery, { each: true })
  readonly includes?: IncludesQuery[]
}
