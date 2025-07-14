import {
  IsDefined,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  IsUrl,
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { UserAccountType, UserGender } from '@app/src/users/user/enums'

export class UserSignupDto {
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

  @ApiProperty({
    description: 'Brand Url, required for business account',
    example: 'https://www.brand.com',
  })
  @IsOptional()
  @IsUrl()
  readonly brand_url?: string

  @ApiProperty({ enum: UserGender, required: true })
  @IsEnum(UserGender, {
    message: 'Invalid gender',
  })
  @IsDefined()
  gender: UserGender

  @ApiProperty({ enum: UserAccountType, required: true })
  @IsEnum(UserAccountType, {
    message: 'Invalid account type',
  })
  @IsDefined()
  readonly account_type: UserAccountType
}
