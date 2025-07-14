import { Type } from 'class-transformer'
import { IsOptional } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { MySearchDto } from '@app/src/shared/base'
import { NonprofitProfileSearchFields } from '@app/src/shared/enums'
import { FilterProperty } from '@app/src/admin/nonprofit/dto/properties'
import { TotalDonation } from '@app/src/nonprofit/donation-projects/dto/properties'

export class ExportQueryDto extends MySearchDto {
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
}
