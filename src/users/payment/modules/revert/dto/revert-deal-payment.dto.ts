import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsString, IsUUID } from 'class-validator'

export class RevertDealPaymentDto {
  @ApiProperty({
    description: 'ID of the Payment to revert',
    example: 'bdf228d2-5153-4b38-86e4-a282e9970234',
    format: 'uuid',
  })
  @IsDefined()
  @IsString()
  @IsUUID()
  readonly payment: string
}
