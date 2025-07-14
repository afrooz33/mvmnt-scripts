import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsEmail, IsNotEmpty, MaxLength } from 'class-validator'

export class ForgotPasswordDto {
  @ApiProperty()
  @IsDefined()
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(50)
  readonly email: string
}
