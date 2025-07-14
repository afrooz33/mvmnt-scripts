import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsEmail, IsNotEmpty, IsStrongPassword, IsUrl, MaxLength } from 'class-validator'

export class AuthSignupDto {
  @ApiProperty()
  @IsDefined()
  @IsNotEmpty()
  @MaxLength(50)
  readonly first_name: string

  @ApiProperty()
  @IsDefined()
  @IsNotEmpty()
  @MaxLength(50)
  readonly last_name: string

  @ApiProperty()
  @IsDefined()
  @IsNotEmpty()
  @MaxLength(50)
  readonly foundation_name: string

  @ApiProperty()
  @IsDefined()
  @IsNotEmpty()
  @IsUrl()
  @MaxLength(50)
  readonly foundation_url: string

  @ApiProperty()
  @IsDefined()
  @IsNotEmpty()
  readonly corporate_number: string

  @ApiProperty()
  @IsDefined()
  @IsNotEmpty()
  @MaxLength(20)
  readonly phone: string

  @ApiProperty()
  @IsDefined()
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(50)
  readonly email: string

  @ApiProperty({
    description: 'Password',
    type: String,
    example: 'Pas$w0rd',
  })
  @IsNotEmpty()
  @MaxLength(99)
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  readonly password: string
}
