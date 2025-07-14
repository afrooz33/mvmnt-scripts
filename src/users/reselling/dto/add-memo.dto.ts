import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty, IsUUID } from 'class-validator'

export class AddMemoDto {
  @ApiProperty({
    description: 'Reselling reward id',
    format: 'uuid',
  })
  @IsUUID()
  @IsDefined()
  @IsNotEmpty()
  readonly reward: string

  @ApiProperty({
    description: 'Reselling reward memo',
  })
  @IsDefined()
  @IsNotEmpty()
  readonly memo: string
}
