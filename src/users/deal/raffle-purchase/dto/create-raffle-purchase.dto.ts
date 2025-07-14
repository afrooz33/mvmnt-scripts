import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsDefined } from 'class-validator'

export class CreateRafflePurchaseDto {
  @ApiProperty({
    description: 'Deal id',
    example: '0d79240f-832e-4d37-b2dd-35ff317f2a50',
    format: 'uuid',
  })
  @IsNotEmpty()
  @IsDefined()
  readonly deal: string

  @ApiProperty({
    description: 'Raffle purchase quantity',
    example: 1,
    format: 'int',
    default: 1,
  })
  @IsNotEmpty()
  @IsDefined()
  readonly quantity: number
}
