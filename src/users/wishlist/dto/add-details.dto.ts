import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsDefined, IsEnum, IsNotEmpty, IsOptional, IsUUID, Min } from 'class-validator'
import { WishlistItemPriority } from '@app/src/users/wishlist/enums'

export class AddDetailsDto {
  @ApiProperty({
    description: 'Wishlist id',
    format: 'uuid',
    required: true,
  })
  @IsUUID()
  @IsDefined()
  @IsNotEmpty()
  readonly wishlist: string

  @ApiProperty({
    description: 'Variant id',
    format: 'uuid',
    required: true,
  })
  @IsUUID()
  @IsDefined()
  @IsNotEmpty()
  readonly variant: string

  @ApiPropertyOptional({
    description: 'Comment',
    type: String,
  })
  @IsOptional()
  readonly comment?: string

  @ApiPropertyOptional({
    description: 'Priority',
    enum: Object.values(WishlistItemPriority),
  })
  @IsEnum(WishlistItemPriority)
  @IsOptional()
  readonly priority?: string

  @ApiPropertyOptional({
    description: 'Needs',
    type: Number,
  })
  @Min(1)
  @IsOptional()
  readonly needs?: number
}
