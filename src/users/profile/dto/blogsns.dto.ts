import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty, IsUrl } from 'class-validator'

export class BlogSnsDto {
  @ApiProperty({
    description: 'Blog url',
    type: String,
    example: 'https://blog.naver.com/username',
  })
  @IsUrl()
  @IsNotEmpty()
  @IsDefined()
  readonly blog_url: string
}
