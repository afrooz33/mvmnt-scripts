import {
  IsUUID,
  IsEnum,
  IsString,
  IsNotEmpty,
  IsOptional,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  ReturnExchangeType,
  ReturnExchangeReason,
} from '@app/src/purchase-history/refund-exchange/enums'

export class CreateReturnExchangeItemDto {
  @ApiProperty({
    description: 'Cart item id',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  cart_item: string

  @ApiProperty({
    description: 'Quantity requested',
    example: 1,
    type: Number,
  })
  @IsNotEmpty()
  quantity_requested: number

  @ApiProperty({
    description: 'Reason',
    example: ReturnExchangeReason.NO_LONGER_NEEDED,
    enum: Object.values(ReturnExchangeReason),
  })
  @IsNotEmpty()
  @IsEnum(ReturnExchangeReason)
  reason: ReturnExchangeReason

  @ApiPropertyOptional({
    description: 'Notes',
  })
  @IsOptional()
  notes?: string
}

export class CreateReturnExchangeDto {
  @ApiPropertyOptional({
    description: 'Cart id',
    format: 'uuid',
  })
  @IsUUID()
  @IsOptional()
  cart?: string

  @ApiPropertyOptional({
    description: 'Auction bid id',
    format: 'uuid',
  })
  @IsUUID()
  @IsOptional()
  bid?: string

  @ApiProperty({
    description: 'Return exchange type',
    enum: Object.values(ReturnExchangeType),
  })
  @IsNotEmpty()
  @IsEnum(ReturnExchangeType)
  type: ReturnExchangeType

  @ApiProperty({
    description: 'Return exchange items',
    type: [CreateReturnExchangeItemDto],
  })
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateReturnExchangeItemDto)
  items: CreateReturnExchangeItemDto[]

  @ApiPropertyOptional({
    description: 'Notes to seller',
  })
  @IsString()
  @IsOptional()
  notes_to_seller?: string
}
