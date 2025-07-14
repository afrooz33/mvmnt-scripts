import { Type } from 'class-transformer'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, IsOptional, IsNotEmpty, IsUUID, IsEnum } from 'class-validator'
import { OrderDirection } from '@app/src/shared/enums'
import { GrossDonationRangeProperty } from '@app/src/admin/deals/dto/properties'
import { FiltersProperty } from './properties'

export class QueryDto {
  @ApiPropertyOptional({
    description: 'Search by keyword',
  })
  @IsString()
  @IsOptional()
  readonly keyword?: string

  @ApiPropertyOptional({ type: FiltersProperty })
  @Type(() => FiltersProperty)
  @IsOptional()
  readonly filter?: FiltersProperty

  @ApiPropertyOptional({
    description: 'Filter by nonprofit id',
    format: 'uuid',
  })
  @IsUUID()
  @IsOptional()
  readonly nonprofit?: string

  @ApiPropertyOptional({
    description: 'Page',
    default: 1,
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  readonly page?: string

  @ApiPropertyOptional({
    description: 'Results per page',
    default: 10,
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  readonly limit?: string

  @ApiPropertyOptional({
    description: 'Total gross donations',
    example: 100,
    type: GrossDonationRangeProperty,
  })
  @IsOptional()
  readonly gross_donation?: GrossDonationRangeProperty

  @ApiPropertyOptional({
    description: 'Order by',
    default: 'created',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly order_by?: string

  @ApiPropertyOptional({
    description: 'Order direction',
    enum: Object.values(OrderDirection),
    default: OrderDirection.DESCENDING,
  })
  @IsOptional()
  @IsEnum(OrderDirection)
  readonly order_direction?: OrderDirection
}
