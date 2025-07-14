import { IsEnum, IsOptional } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { DealType, DealStatus, ItemCondition, ShippingCoveredBy } from '@app/src/users/deal/enums'

export class FiltersProperty {
  @ApiPropertyOptional({
    name: 'filter[deal_type]',
    description: 'Deal type',
    enum: Object.values(DealType),
  })
  @IsOptional()
  @IsEnum(DealType)
  readonly deal_type?: DealType

  @ApiPropertyOptional({
    name: 'filter[item_condition]',
    description: 'Item condition',
    enum: Object.values(ItemCondition),
  })
  @IsOptional()
  @IsEnum(ItemCondition)
  readonly item_condition?: ItemCondition

  @ApiPropertyOptional({
    name: 'filter[shipping_covered_by]',
    description: 'Deal shipping covered by',
    enum: Object.values(ShippingCoveredBy),
  })
  @IsOptional()
  @IsEnum(ShippingCoveredBy)
  readonly shipping_covered_by: ShippingCoveredBy

  @ApiPropertyOptional({
    name: 'filter[userId]',
    description: 'Deal user id',
  })
  @IsOptional()
  readonly userId?: string

  @ApiPropertyOptional({
    name: 'filter[status]',
    description: 'Deal status',
    enum: [
      DealStatus.DRAFT,
      DealStatus.ENDED,
      DealStatus.ON_DEAL,
      DealStatus.UNLISTED,
      DealStatus.SCHEDULED,
    ],
  })
  @IsOptional()
  readonly status?: string
}
