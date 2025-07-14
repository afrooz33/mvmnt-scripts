import { IsEnum, IsOptional } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { DonationType } from '@app/src/donations/enums'

export class DonationFiltersProperty {
  @ApiPropertyOptional({
    description: 'Donation source type',
    name: 'filter[donation_type]',
    enum: Object.values(DonationType),
  })
  @IsOptional()
  @IsEnum(DonationType, {
    message: 'Invalid donation source type.',
  })
  readonly donation_type?: DonationType
}
