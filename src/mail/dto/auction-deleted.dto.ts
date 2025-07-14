import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class AuctionDeletedDto {
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
  readonly data: any
}
