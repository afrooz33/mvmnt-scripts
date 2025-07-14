import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class NonprofitUserAccountVerificationDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly username: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly brand_url: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  readonly email: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  readonly user_email: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly verificationLink: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly name: string
}
