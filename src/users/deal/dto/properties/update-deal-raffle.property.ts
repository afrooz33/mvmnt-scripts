import { IsDefined, IsNotEmpty, IsUUID } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { DealRaffle } from './'

export class UpdateDealRaffle extends DealRaffle {
  @ApiProperty({
    type: 'string',
    format: 'uuid',
    example: '10229230-08c6-42e1-859a-507a780256eb',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsUUID()
  readonly id: string
}
