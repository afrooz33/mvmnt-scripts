import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDefined,
  IsNotEmpty,
  IsUUID,
  ValidateIf,
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { DealType } from '@app/src/users/deal/enums'
import { UpdateDealRaffle, UpdateDealVariant, UpdateDealShippingFee } from './properties'
import { CreateDealDto } from './'

export class UpdateDealDto extends CreateDealDto {
  @ApiProperty({
    type: 'string',
    format: 'uuid',
    example: '10229230-08c6-42e1-859a-507a780256eb',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsUUID()
  readonly id: string

  @ValidateIf((o) => o.deal_type === DealType.BUYNOW)
  @ApiProperty({
    type: [UpdateDealVariant],
  })
  @IsDefined()
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  readonly variants?: UpdateDealVariant[]

  @ApiProperty({
    type: () => [UpdateDealShippingFee],
  })
  @IsDefined()
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  readonly shipping_fee: UpdateDealShippingFee[]

  @ValidateIf((o) => o.deal_type === DealType.RAFFLE)
  @ApiProperty({
    type: UpdateDealRaffle,
  })
  @IsDefined()
  @IsNotEmpty()
  readonly raffles?: UpdateDealRaffle
}
