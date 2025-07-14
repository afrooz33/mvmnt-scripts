import { ApiProperty } from '@nestjs/swagger'

import { IsDefined, IsNotEmpty, IsString, MinLength } from 'class-validator'

export class UserLoginDto {
  @ApiProperty()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
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
