import { IsDefined, IsNotEmpty } from 'class-validator'
import { ApiProperty, PartialType } from '@nestjs/swagger'
import { DealPrizes } from './'

export class UpdateDealPrizes extends PartialType(DealPrizes) {
  @ApiProperty()
  @IsNotEmpty()
  @IsDefined()
  readonly id: string
}
