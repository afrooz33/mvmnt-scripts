import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty } from 'class-validator'

export class ResendChangeEmailDto {
  @ApiProperty({
    description: 'Email address',
    example: 'example@gmail.com',
  })
  @IsEmail()
  @IsNotEmpty()
  readonly email: string
}
