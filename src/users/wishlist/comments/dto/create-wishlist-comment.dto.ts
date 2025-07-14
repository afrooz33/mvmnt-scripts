import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty, IsOptional, IsUUID } from 'class-validator'

export class CreateWishlistCommentDto {
  @ApiProperty({
    description: 'Comment',
    type: String,
    nullable: false,
    maxLength: 500,
  })
  @IsDefined()
  @IsNotEmpty()
  readonly comment: string

  @ApiProperty({
    description: 'Wishlist id',
    type: String,
    nullable: false,
    format: 'uuid',
  })
  @IsUUID()
  @IsDefined()
  @IsNotEmpty()
  readonly wishlist: string

  @ApiProperty({
    description: 'Wishlist variant id',
    type: String,
    nullable: false,
    format: 'uuid',
  })
  @IsUUID()
  @IsDefined()
  @IsNotEmpty()
  readonly variant: string

  @ApiPropertyOptional({
    description: 'Reply to comment id',
    format: 'uuid',
    nullable: true,
    default: null,
  })
  @IsUUID()
  @IsOptional()
  readonly parent?: string
}
