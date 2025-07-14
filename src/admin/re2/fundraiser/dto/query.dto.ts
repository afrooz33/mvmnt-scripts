import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, IsOptional, IsNotEmpty, IsUUID, IsEnum } from 'class-validator'
import { OrderDirection } from '@app/src/shared/enums'

export class QueryDto {
  @ApiPropertyOptional({
    description: 'Filter by re2 user id',
    format: 'uuid',
  })
  @IsUUID()
  @IsOptional()
  readonly user?: string

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
