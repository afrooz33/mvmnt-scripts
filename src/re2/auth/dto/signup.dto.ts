import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsEmail, IsNotEmpty, IsString, IsStrongPassword } from 'class-validator'

export class SignupDto {
  @ApiProperty()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  readonly first_name: string

  @ApiProperty()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  readonly last_name: string

  @ApiProperty()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  readonly company_name: string

  @ApiProperty()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  readonly phone: string

  @ApiProperty()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  readonly email: string

  @ApiProperty({
    description: 'Password',
    type: String,
    example: '********',
  })
  @IsNotEmpty()
  @IsDefined()
  @IsString()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  readonly password: string
}
