import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty } from 'class-validator'

export class ReportReviewDto {
  @ApiProperty({
    description: 'Description',
    format: 'string',
    example: 'This is a review report description',
    nullable: true,
  })
  @IsDefined()
  @IsNotEmpty()
  readonly description: string
}
