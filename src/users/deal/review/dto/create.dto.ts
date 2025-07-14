import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty, IsOptional } from 'class-validator'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'

export class CreateReviewDto {
  @ApiProperty({
    description: 'Deal ID',
    format: 'uuid',
    example: 'b6d7e3a0-0d1a-4b1a-8c0a-5f0a4f9a7f9e',
    nullable: false,
  })
  @IsNotEmpty()
  @IsDefined()
  readonly deal: DealEntity

  @ApiPropertyOptional({
    description: 'Description',
    format: 'string',
    example: 'This is a review',
    nullable: true,
  })
  @IsOptional()
  readonly description: string

  @ApiProperty({
    description: 'Rating',
    format: 'number',
    example: 5,
    nullable: false,
  })
  @IsNotEmpty()
  @IsDefined()
  readonly rating: number
}
