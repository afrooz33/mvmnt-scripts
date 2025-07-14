import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty, IsStrongPassword, MaxLength } from 'class-validator'

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Password',
    type: String,
    example: 'Pas$w0rd',
  })
  @IsNotEmpty()
  @IsDefined()
  @MaxLength(99)
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  readonly current: string

  @ApiProperty({
    description: 'Password',
    type: String,
    example: 'Pas$w0rd',
  })
  @IsNotEmpty()
  @IsDefined()
  @MaxLength(99)
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  readonly new: string
}
