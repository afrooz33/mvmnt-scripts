import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsOptional } from 'class-validator'
import { DealType } from '@app/src/users/deal/enums'

export class FiltersProperty {
  @ApiPropertyOptional({
    name: 'filter[deal_type]',
    description: 'Filter by deal type',
    enum: Object.values(DealType),
    default: DealType.AUCTION,
  })
  @IsOptional()
  @IsEnum(DealType)
  readonly deal_type?: DealType
}
