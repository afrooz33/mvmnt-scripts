import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsNotEmpty, IsDefined } from 'class-validator'

export class AdminMemoDto {
  @ApiProperty({
    description: 'Admin memo',
    default: '',
  })
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  readonly admin_memo?: string
}
