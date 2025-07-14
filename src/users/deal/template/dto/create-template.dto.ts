import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty, MaxLength } from 'class-validator'

export class CreateTemplateDto {
  @ApiProperty({
    name: 'title',
    description: 'Title',
  })
  @IsNotEmpty()
  @IsDefined()
  @MaxLength(255)
  readonly title: string

  @ApiProperty({
    name: 'content',
    description: 'Content',
  })
  @IsNotEmpty()
  @IsDefined()
  readonly content: string
}
