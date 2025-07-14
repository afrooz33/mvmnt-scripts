import { ApiProperty } from '@nestjs/swagger'

import { IsDefined, IsEmail, IsString, MinLength } from 'class-validator'

export class UserDataDto {
  @ApiProperty()
  @IsEmail()
  readonly email: string

  @ApiProperty()
  @IsDefined()
  @IsString()
  @MinLength(6)
  readonly password: string
}
