import { ApiProperty } from '@nestjs/swagger'

import { IsDefined, IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator'

export class AdminLoginDto {
  @ApiProperty()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  readonly email: string

  @ApiProperty({
    default: 'Pas$W0rd',
  })
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  readonly password: string
}
