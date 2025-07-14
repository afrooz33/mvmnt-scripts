import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty, IsNumber } from 'class-validator'

export class BlockDetails {
  @ApiProperty({
    name: 'days',
    description: 'Number of days to block user',
    example: 2,
    type: 'number',
  })
  @IsNotEmpty()
  @IsDefined()
  @IsNumber()
  readonly days: number
}
