import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsDefined, IsEmail, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator'

export class NonprofitProfileDto {
  @ApiProperty({ format: 'uuid' })
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

  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  readonly password: string

  @ApiProperty()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  readonly foundation_name: string

  @ApiProperty()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  readonly corporate_number: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  @IsUrl()
  readonly foundation_url: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  readonly phone: string
}
