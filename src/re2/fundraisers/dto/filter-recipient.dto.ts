import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsUUID,
  IsEnum,
  IsArray,
  IsString,
  IsOptional,
  IsNotEmpty,
  ArrayMinSize,
  ArrayMaxSize,
  ValidateIf,
} from 'class-validator'
import { OrderDirection, Query } from '@app/src/shared/enums'
import { FilterRecipientOrderBy } from '@app/src/re2/fundraisers/enums'

export class FilterRecipientDto {
  @ApiPropertyOptional({
    description: 'Search by keyword',
  })
  @IsOptional()
  @IsString()
  readonly keyword?: string

  @IsOptional()
  readonly includeIds?: string[]

  @ApiPropertyOptional({
    name: 'includeIds[tags][]',
    description: 'Filter by tags',
    isArray: true,
    format: 'uuid',
  })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true, message: 'Invalid tags' })
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  readonly tags?: string[]

  @ApiProperty({
    description: 'Recipient type',
    enum: [Query.NONPROFIT, Query.DONATION_PROJECT],
  })
  @IsNotEmpty()
  @IsEnum([Query.NONPROFIT, Query.DONATION_PROJECT])
  readonly type: Query.NONPROFIT | Query.DONATION_PROJECT

  @ApiPropertyOptional({
    description: 'Order by',
    default: FilterRecipientOrderBy.DONATION_PROJECT_NAME,
    enum: Object.values(FilterRecipientOrderBy),
  })
  @IsOptional()
  @IsEnum(FilterRecipientOrderBy)
  readonly order_by?: FilterRecipientOrderBy

  @ApiPropertyOptional({
    description: 'Order direction',
    enum: Object.values(OrderDirection),
    default: OrderDirection.DESCENDING,
  })
  @IsOptional()
  @IsEnum(OrderDirection)
  @ValidateIf((o) => o.order_by)
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
}
