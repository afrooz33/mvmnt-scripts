import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty } from 'class-validator'

export class UpdateNoteDto {
  @ApiProperty({
    description: 'Deal id',
    example: '0d79240f-832e-4d37-b2dd-35ff317f2a50',
    format: 'uuid',
  })
  @IsNotEmpty()
  @IsDefined()
  deal: string

  @ApiProperty({
    description: 'Note',
    example: 'This is a note',
  })
  @IsNotEmpty()
  @IsDefined()
  note: string
}
