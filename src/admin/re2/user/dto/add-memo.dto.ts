import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty, IsUUID } from 'class-validator'

export class Re2AddMemoDto {
  @ApiProperty({
    description: 'Memo',
    example: 'This is a memo',
  })
  @IsDefined()
  @IsNotEmpty()
  readonly admin_memo: string

  @ApiProperty({
    description: 'RE2 user id',
    format: 'uuid',
    example: '74f83bb6-cabf-490a-ad25-620d9a5782ef',
  })
  @IsUUID()
  @IsDefined()
  @IsNotEmpty()
  readonly user: string
}
