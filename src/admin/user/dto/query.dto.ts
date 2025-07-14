import { IsOptional, IsEnum, ArrayMaxSize, IsArray, IsNotEmpty, IsString } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { OrderDirection } from '@app/src/shared/enums'
import { IncludesQuery } from '@app/src/admin/user/enums'

export class QueryDto {
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

  @ApiPropertyOptional({
    description: 'Page',
    default: 1,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly page?: string

  @ApiPropertyOptional({
    description: 'Results per page',
    default: 10,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly limit?: string

  @ApiPropertyOptional({
    name: 'includes[]',
    description: 'Relations',
    isArray: true,
    enum: Object.values(IncludesQuery),
    nullable: true,
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(2)
  @IsEnum(IncludesQuery, { each: true })
  readonly includes?: IncludesQuery[]
}
