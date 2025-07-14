import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty, IsString, IsStrongPassword } from 'class-validator'

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Password',
    type: String,
    example: 'PAs$W0rd',
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
  readonly newPassword: string

  @ApiProperty()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  readonly confirmPassword: string
}
