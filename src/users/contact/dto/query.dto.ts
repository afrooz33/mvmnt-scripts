import { IsEnum, IsOptional } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { MySearchDto } from '@app/src/shared/base'
import { DealType } from '@app/src/users/deal/enums'
import { MessageType } from '@app/src/users/contact/enums'
import { LastSentDateRangeProperty } from './properties'

export class QueryDto extends MySearchDto {
  @ApiPropertyOptional({
    description:
      'Search keyword (applies to deal name for CONTACT_US, potentially order/deal for ORDER_RELATED)',
    type: String,
  })
  readonly keyword?: string

  @ApiPropertyOptional({
    name: 'deal_type',
    description: 'Deal type filter (applies mainly to CONTACT_US)',
    enum: Object.values(DealType),
  })
  @IsOptional()
  @IsEnum(DealType)
  readonly deal_type?: DealType

  @ApiPropertyOptional({
    name: 'message_type',
    description: 'Filter by message source',
    enum: Object.values(MessageType),
    default: MessageType.ALL,
  })
  @IsOptional()
  @IsEnum(MessageType)
  readonly message_type?: MessageType

  @ApiPropertyOptional({
    type: LastSentDateRangeProperty,
    name: 'last_sent',
    description: 'Last sent/updated date range',
  })
  @IsOptional()
  readonly last_sent?: LastSentDateRangeProperty
}
