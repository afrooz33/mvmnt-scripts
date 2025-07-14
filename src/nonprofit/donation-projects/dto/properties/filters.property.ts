import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsOptional } from 'class-validator'
import { DonationProjectStatus } from '@app/src/nonprofit/donation-projects/enums'

export class FiltersProperty {
  @ApiPropertyOptional({
    description: 'Donation project status',
    name: 'filter[status]',
    enum: Object.values(DonationProjectStatus),
    default: DonationProjectStatus.PUBLISHED,
  })
  @IsOptional()
  @IsEnum(DonationProjectStatus, {
    message: 'Invalid donation project status.',
  })
  readonly status?: DonationProjectStatus
}
