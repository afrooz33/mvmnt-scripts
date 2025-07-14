import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsOptional, IsUUID } from 'class-validator'
import { MySearchDto } from '@app/src/shared/base'
import { ContactRequestStatus } from '@app/src/purchase-history/contact-seller/enums'

export class QueryDto extends MySearchDto {
  @ApiPropertyOptional({
    enum: ContactRequestStatus,
    description: 'Filter by request status',
  })
  @IsOptional()
  @IsEnum(ContactRequestStatus)
  status?: ContactRequestStatus

  @ApiPropertyOptional({
    description: 'Filter by order ID (UserDealPaymentEntity UUID)',
    format: 'uuid',
  })
  @IsUUID()
  @IsOptional()
  order?: string
}
