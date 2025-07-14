import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsEmail, IsNotEmpty } from 'class-validator'

export class ChangeEmailDto {
  @ApiProperty({
    description: 'The new email address',
    example: 'example@gmail.com',
  })
  @IsNotEmpty()
  @IsDefined()
  @IsEmail()
  readonly email: string

  @ApiProperty({
    description: 'The token sent to the new email address',
    example: 123456,
  })
  @IsNotEmpty()
  @IsDefined()
  readonly token: number
}
