import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty, IsUUID } from 'class-validator'

export class MoveWishlistDto {
  @ApiProperty({
    type: String,
    required: true,
    description: 'The old wishlist id',
  })
  @IsUUID()
  @IsDefined()
  @IsNotEmpty()
  readonly old_wishlist: string

  @ApiProperty({
    type: String,
    required: true,
    description: 'The new wishlist id',
  })
  @IsUUID()
  @IsDefined()
  @IsNotEmpty()
  readonly new_wishlist: string

  @ApiProperty({
    type: String,
    required: true,
    description: 'The variant id',
  })
  @IsUUID()
  @IsDefined()
  @IsNotEmpty()
  readonly variant: string
}
