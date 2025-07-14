import { ApiProperty } from '@nestjs/swagger'
import { IsUUID, IsDefined, IsOptional, ValidateIf } from 'class-validator'

export class ReturnHistoryQueryDto {
  @ApiProperty({
    description: 'Cart id',
    format: 'uuid',
    required: false,
  })
  @IsUUID()
  @ValidateIf((o) => !o.bid)
  @IsDefined({ message: 'Cart ID is required when bid is not provided' })
  cart?: string

  @ApiProperty({
    description: 'Cart item id',
    format: 'uuid',
    required: false,
  })
  @IsUUID()
  @ValidateIf((o) => !!o.cart && !o.bid)
  @IsDefined({ message: 'Cart item ID is required when cart is provided' })
  cart_item?: string

  @ApiProperty({
    description: 'Bid id',
    format: 'uuid',
    required: false,
  })
  @IsUUID()
  @ValidateIf((o) => !o.cart && !o.cart_item)
  @IsOptional()
  bid?: string
}
