import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsDefined, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class UpdateProfileDto {
  @ApiProperty({ format: 'uuid' })
  @IsNotEmpty()
  @IsDefined()
  readonly id: string

  @ApiPropertyOptional()
  @IsEmail()
  @IsOptional()
  readonly email?: string

  @ApiPropertyOptional()
  @IsEmail()
  @IsNotEmpty()
  readonly notification_email: string

  @ApiProperty()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  readonly company_name: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  readonly phone: string

  @ApiProperty()
  @IsString()
  @IsOptional()
  readonly timezone?: string
}
