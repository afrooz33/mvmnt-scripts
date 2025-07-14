import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty, IsOptional, IsUUID } from 'class-validator'

export class CreateCommentDto {
  @ApiProperty({
    description: 'Comment',
    example: 'This is a comment',
  })
  @IsDefined()
  @IsNotEmpty()
  readonly comment: string

  @ApiProperty({
    description: 'Activity report',
    format: 'uuid',
  })
  @IsUUID()
  @IsDefined()
  @IsNotEmpty()
  readonly activity_report: string

  @ApiPropertyOptional({
    description: 'Activity report',
    format: 'uuid',
  })
  @IsUUID()
  @IsOptional()
  readonly parent: string
}
