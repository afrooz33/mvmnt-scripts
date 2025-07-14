import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class DonationProjectToBeCancelDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly username: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  readonly email: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly cancel_date: string
}
