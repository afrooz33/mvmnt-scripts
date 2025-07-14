import { Type } from 'class-transformer'
import { IsOptional } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { MySearchDto } from '@app/src/shared/base'
import { UserDonationFiltersProperty, DonationDateRange } from './properties'

export class HistoryQueryDto extends MySearchDto {
  @ApiPropertyOptional({ type: UserDonationFiltersProperty })
  @Type(() => UserDonationFiltersProperty)
  @IsOptional()
  readonly filter?: UserDonationFiltersProperty

  @ApiPropertyOptional({
    type: DonationDateRange,
    description: 'Donation date',
  })
  @IsOptional()
  readonly donation_date?: DonationDateRange
}
