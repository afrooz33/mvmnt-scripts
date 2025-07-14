import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty, IsUUID, Min } from 'class-validator'

export class ReorderItemDto {
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Wishlist id',
  })
  @IsUUID()
  @IsDefined()
  @IsNotEmpty()
  readonly wishlist: string

  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Variant id',
  })
  @IsUUID()
  @IsDefined()
  @IsNotEmpty()
  readonly variant: string

  @ApiProperty({
    description: 'New sorting order',
    type: Number,
  })
  @Min(1)
  @IsDefined()
  @IsNotEmpty()
  readonly sorting_order: number
}
