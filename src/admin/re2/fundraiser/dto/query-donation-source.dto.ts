import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, IsOptional, IsNotEmpty, IsUUID, IsEnum, ValidateIf } from 'class-validator'
import { OrderDirection } from '@app/src/shared/enums'
import { GrossDonationRangeProperty } from '@app/src/admin/deals/dto/properties'
import { Re2DonationSourceType, Re2DonationSourceStatus } from '@app/src/admin/re2/fundraiser/enums'
import { DateRange } from './properties'

export class QueryDonationSourceDto {
  @ApiPropertyOptional({
    description: 'Search by keyword',
  })
  @IsString()
  @IsOptional()
  readonly keyword?: string

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
    description: 'Fundraiser or integration type',
    enum: Object.values(Re2DonationSourceType),
  })
  @IsOptional()
  @IsEnum(Re2DonationSourceType)
  readonly type?: Re2DonationSourceType

  @ApiPropertyOptional({
    description: 'Status of fundraiser or integration',
    enum: Object.values(Re2DonationSourceStatus),
  })
  @IsOptional()
  @IsEnum(Re2DonationSourceStatus)
  @ValidateIf((o) => o.status !== '')
  readonly status?: Re2DonationSourceStatus

  @ApiPropertyOptional({
    description: 'Gross donation range',
    type: GrossDonationRangeProperty,
  })
  @IsNotEmpty()
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

  @ApiPropertyOptional({ description: 'Donation source start and end date' })
  @IsOptional()
  @IsNotEmpty()
  readonly start_date?: DateRange
}
