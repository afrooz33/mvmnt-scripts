import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty, IsString, IsStrongPassword } from 'class-validator'

export class EnableTwoAuthDto {
  @ApiProperty({
    description: 'The two-factor authentication code',
    example: '123456',
  })
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  readonly code: string

  @ApiProperty({
    description: 'Password',
    type: String,
    example: '********',
  })
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  readonly password: string
}
