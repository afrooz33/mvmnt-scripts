import { ApiProperty } from '@nestjs/swagger'
import { ArrayMaxSize, ArrayMinSize, IsArray, IsDefined, IsNotEmpty, IsUUID } from 'class-validator'
import { DealVariant, UpdateDealVariantOption } from './'

export class UpdateDealVariant extends DealVariant {
  @ApiProperty({
    type: 'string',
    format: 'uuid',
    example: '10229230-08c6-42e1-859a-507a780256eb',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsUUID()
  readonly id: string

  @ApiProperty({
    type: [UpdateDealVariantOption],
  })
  @IsDefined()
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(4)
  readonly option_values: UpdateDealVariantOption[]
}
