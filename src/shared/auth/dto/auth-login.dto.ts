import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  MaxLength,
} from 'class-validator'

export class AuthLoginDto {
  @ApiProperty()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(50)
  readonly email: string

  @ApiProperty({
    description: 'Password',
    type: String,
    example: '********',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(99)
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  readonly password: string

  @ApiPropertyOptional({
    description: 'Remember me',
    type: Boolean,
    example: true,
    default: false,
  })
  @IsOptional()
  readonly rememberMe?: boolean
}
