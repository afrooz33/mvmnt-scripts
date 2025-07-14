import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsUUID } from 'class-validator'
import { CreateDeliveryCarrierDto } from './create-delivery-carrier.dto'

export class UpdateDeliveryCarrierDto extends CreateDeliveryCarrierDto {
  @ApiPropertyOptional({
    description: 'Delivery Carrier Id',
    format: 'uuid',
  })
  @IsUUID()
  @IsOptional()
  readonly id?: string
}
