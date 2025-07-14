import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class ContactSellerNotificationDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  readonly email: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly username: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly subject: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly buyerName: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly messageExcerpt: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly orderId: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly linkToRequest: string
}
