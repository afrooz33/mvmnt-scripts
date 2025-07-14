import { IsDefined, IsNotEmpty, IsUUID } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { DealShippingFee } from './'

export class UpdateDealShippingFee extends DealShippingFee {
  @ApiProperty({
    type: 'string',
    format: 'uuid',
    example: 'e9302695-d02e-4f1a-b021-41c332aa21a6',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsUUID()
  readonly id: string
}
