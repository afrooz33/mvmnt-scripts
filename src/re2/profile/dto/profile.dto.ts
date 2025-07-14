import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator'

export class ProfileDto {
  @ApiProperty({ format: 'uuid' })
  @IsOptional()
  readonly id: string

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

  @ApiPropertyOptional()
  @IsEmail()
  @IsNotEmpty()
  readonly email: string

  @ApiProperty({
    description: 'Password',
    type: String,
    example: '********',
  })
  @IsNotEmpty()
  @IsOptional()
  @IsString()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  readonly password: string

  @ApiProperty()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  readonly company_name: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  readonly phone: string
}
