import { ApiProperty } from '@nestjs/swagger'
import { DealVariantOption } from './'

export class UpdateDealVariantOption extends DealVariantOption {
  @ApiProperty()
  readonly id: string
}
