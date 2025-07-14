import {
  Min,
  IsInt,
  IsEnum,
  IsUUID,
  IsArray,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { CancellationReason } from '@app/src/purchase-history/cancel-order/enums'

export class CancellationItemDto {
  @ApiProperty({
    description: 'Cart item ID to cancel',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  cart_item: string

  @ApiProperty({
    description: 'Quantity to cancel',
    example: 1,
    minimum: 1,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  quantity_to_cancel: number

  @ApiProperty({
    description: 'Reason for cancellation',
    enum: CancellationReason,
    example: CancellationReason.ORDER_CREATED_BY_MISTAKE,
  })
  @IsNotEmpty()
  @IsEnum(CancellationReason)
  reason: CancellationReason
}

export class CreateCancellationDto {
  @ApiProperty({
    description: 'Cart ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  cart: string

  @ApiPropertyOptional({
    description: 'Bid ID (for auction orders, not yet supported)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  bid?: string

  @ApiProperty({
    description: 'Items to cancel',
    type: [CancellationItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CancellationItemDto)
  items: CancellationItemDto[]
}
