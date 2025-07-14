import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsOptional } from 'class-validator'
import { DonationType } from '@app/src/donations/enums'

export class UserDonationFiltersProperty {
  @ApiPropertyOptional({
    name: 'filter[reason]',
    enum: Object.values(DonationType),
  })
  @IsEnum(DonationType)
  @IsOptional()
  readonly reason?: DonationType
}
