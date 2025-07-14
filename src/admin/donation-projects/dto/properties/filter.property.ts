import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsOptional } from 'class-validator'
import { DonationProjectStatus } from '@app/src/nonprofit/donation-projects/enums'

export class FilterProperty {
  @ApiPropertyOptional({
    name: 'filter[status]',
    description: 'Filter',
    enum: Object.values(DonationProjectStatus),
    nullable: true,
  })
  @IsOptional()
  @IsEnum(DonationProjectStatus)
  readonly status?: DonationProjectStatus
}
