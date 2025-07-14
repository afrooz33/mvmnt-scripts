import { ApiProperty } from '@nestjs/swagger'
import { IsUrl, IsEmail, IsString, IsDefined, IsNotEmpty, IsStrongPassword } from 'class-validator'

export class NonprofitSignupDto {
  @ApiProperty({
    description: 'User email',
    type: String,
    example: 'user@gmail.com',
  })
  @IsEmail()
  @IsNotEmpty()
  @IsDefined()
  @IsString()
  readonly email: string

  @ApiProperty({
    description: 'Username',
    type: String,
    example: 'unique_username',
  })
  @IsNotEmpty()
  @IsDefined()
  @IsString()
  readonly username: string

  @ApiProperty({
    description: 'Display name',
    type: String,
    example: 'User name',
  })
  @IsNotEmpty()
  @IsDefined()
  @IsString()
  readonly display_name: string

  @ApiProperty({
    description: 'Password',
    type: String,
    example: 'Pas$w0rd',
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

  @ApiProperty({
    description: 'Brand Url, required for business account',
    example: 'https://www.brand.com',
  })
  @IsUrl()
  @IsNotEmpty()
  readonly brand_url: string

  @ApiProperty({
    description: 'Nonprofit user id',
    format: 'uuid',
  })
  @IsDefined()
  @IsNotEmpty()
  nonprofit: string
}
