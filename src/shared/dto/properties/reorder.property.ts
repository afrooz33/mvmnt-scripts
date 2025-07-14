import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty } from 'class-validator'

export class ReorderProperty {
  @ApiProperty({
    type: 'string',
    format: 'uuid',
    required: true,
  })
  @IsDefined()
  @IsNotEmpty()
  readonly id: string

  @ApiProperty({
    type: 'number',
    required: true,
  })
  @IsDefined()
  @IsNotEmpty()
  readonly display_order: number
}
