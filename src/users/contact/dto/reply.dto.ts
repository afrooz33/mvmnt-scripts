import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsArray, IsDefined, IsNotEmpty, IsOptional } from 'class-validator'

export class ReplyDto {
  @ApiProperty({
    description: 'Reply to the support team',
    example: 'Hello, I have a problem with my account',
  })
  @IsNotEmpty()
  @IsDefined()
  readonly message: string

  @ApiPropertyOptional({
    description: 'Attachments',
    example: ['l9qUYwzPA95QEFXzQ1y9a60Ud'],
  })
  @IsArray()
  @IsOptional()
  readonly attachment: string[]
}
