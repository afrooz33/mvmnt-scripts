import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsEmail, IsNotEmpty } from 'class-validator'

export class ChangeUserEmailDto {
  @ApiProperty({
    description: 'User email',
    example: 'newemail@mvmnts.com',
    type: 'string',
  })
  @IsEmail()
  @IsDefined()
  @IsNotEmpty()
  readonly email: string
}
