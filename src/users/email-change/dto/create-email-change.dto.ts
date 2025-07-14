import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsEmail, IsNotEmpty } from 'class-validator'

export class CreateEmailChangeDto {
  @ApiProperty({
    description: 'New email',
    example: 'example@gmail.com',
    nullable: false,
  })
  @IsNotEmpty()
  @IsDefined()
  @IsEmail()
  readonly email: string
}
