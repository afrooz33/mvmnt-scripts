import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty } from 'class-validator'

export class ChangeRaffleWinnerDto {
  @ApiProperty({
    format: 'uuid',
    default: '957fafa4-0648-43d7-9620-e9542465f3b6',
  })
  @IsNotEmpty()
  @IsDefined()
  readonly deal: string

  @ApiProperty({
    description: 'Username of the new winner',
    default: 'brewmaster',
  })
  @IsNotEmpty()
  @IsDefined()
  readonly username: string
}
