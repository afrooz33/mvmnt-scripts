import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsDefined, IsEmail, IsNotEmpty, IsOptional, MaxLength } from 'class-validator'

export class AuthLoginDto {
  @ApiProperty({
    description: 'Email',
    type: String,
    example: 'example@gmail.com',
  })
  @IsDefined()
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
  @IsDefined()
  @MaxLength(99)
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
