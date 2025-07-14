import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, IsOptional, IsNotEmpty, IsEnum, IsUUID } from 'class-validator'
import { DealType } from '@app/src/users/deal/enums'
import { PurchaseDateRange } from './properties'

export class QueryDto {
  @ApiPropertyOptional({
    description: 'Search by keyword',
  })
  @IsOptional()
  @IsString()
  readonly keyword?: string

  @ApiPropertyOptional({
    description: 'Order id',
    format: 'uuid',
  })
  @IsUUID()
  @IsOptional()
  readonly order_id?: string

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
    description: 'Purchase date range',
  })
  @IsOptional()
  readonly purchase_date?: PurchaseDateRange

  @ApiPropertyOptional({
    description: 'Deal type',
    enum: Object.values(DealType),
  })
  @IsOptional()
  @IsEnum(DealType)
  readonly deal_type?: DealType
}
