import { Type } from 'class-transformer'
import { IsEnum, IsOptional } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { MySearchDto } from '@app/src/shared/base'
import { WishlistItemPriority } from '@app/src/users/wishlist/enums'
import { PriceRangeProperty } from './properties'

enum WishlistQuantity {
  ALL = 'ALL',
  STILL_NEEDED = 'STILL_NEEDED',
  TARGET_QUANTITY_REACHED = 'TARGET_QUANTITY_REACHED',
}

export class QueryItemDto extends MySearchDto {
  @ApiPropertyOptional({
    description: 'Filter by variant name',
    type: String,
  })
  @IsOptional()
  readonly item_name?: string

  @ApiPropertyOptional({
    description: 'Price range',
  })
  @IsOptional()
  @Type(() => PriceRangeProperty)
  readonly price?: PriceRangeProperty

  @ApiPropertyOptional({
    description: 'Priority',
    enum: Object.values(WishlistItemPriority),
    default: WishlistItemPriority.HIGH,
  })
  @IsEnum(WishlistItemPriority)
  @IsOptional()
  readonly priority?: WishlistItemPriority

  @ApiPropertyOptional({
    description: 'Quantity',
    enum: Object.values(WishlistQuantity),
  })
  @IsOptional()
  @IsEnum(WishlistQuantity)
  readonly quantity?: WishlistQuantity
}
