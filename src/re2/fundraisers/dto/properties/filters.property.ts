import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsOptional } from 'class-validator'
import { FundraiserFilterStatus, FundraiserType } from '@app/src/re2/fundraisers/enums'

export class FiltersProperty {
  @ApiPropertyOptional({
    description: 'Fundraiser status',
    name: 'filter[status]',
    enum: Object.values(FundraiserFilterStatus),
    default: FundraiserFilterStatus.PUBLISHED,
  })
  @IsOptional()
  @IsEnum(FundraiserFilterStatus, {
    message: 'Invalid fundraiser status.',
  })
  readonly status?: FundraiserFilterStatus

  @ApiPropertyOptional({
    description: 'Fundraiser type',
    name: 'filter[type]',
    enum: Object.values(FundraiserType),
    default: FundraiserType.FORM,
  })
  @IsOptional()
  @IsEnum(FundraiserType, {
    message: 'Invalid fundraiser type.',
  })
  readonly type?: FundraiserType
}
