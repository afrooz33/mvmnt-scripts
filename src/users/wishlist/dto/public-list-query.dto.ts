import { Type } from 'class-transformer'
import { IsEnum, IsOptional } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { MySearchDto } from '@app/src/shared/base'
import { WishlistSearchFields } from '@app/src/shared/enums'
import { PurchaseDateFilter } from '@app/src/users/wishlist/enums'
import { FiltersProperty } from './properties'

export class PublicListQueryDto extends MySearchDto {
  constructor() {
    super(WishlistSearchFields)
  }

  @ApiPropertyOptional({ type: FiltersProperty })
  @Type(() => FiltersProperty)
  @IsOptional()
  readonly filter?: FiltersProperty

  @ApiPropertyOptional({
    description: 'Deadline filter',
    enum: Object.values(PurchaseDateFilter),
    default: PurchaseDateFilter.ALL,
  })
  @IsOptional()
  @IsEnum(PurchaseDateFilter)
  readonly deadline_filter?: PurchaseDateFilter
}
