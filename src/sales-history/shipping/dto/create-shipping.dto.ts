import {
  IsUUID,
  IsArray,
  IsDefined,
  IsString,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
  IsDateString,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { ShippingStatus } from '@app/src/sales-history/shipping/enums'

export class CreateShippingItemDto {
  @ApiProperty({
    description: 'The ID of the cart item',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  cart_item: string

  @ApiProperty({
    description: 'The quantity of the item',
  })
  @IsNotEmpty()
  quantity: number

  @ApiPropertyOptional({
    description: 'The date the item was shipped',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  shipped_at?: string
}

export class CreateShippingTrackingDto {
  @ApiProperty({
    description: 'The tracking number',
  })
  @IsString()
  @IsNotEmpty()
  tracking_number: string

  @ApiPropertyOptional({
    description: 'The ID of the delivery carrier',
    format: 'uuid',
  })
  @IsUUID()
  @IsOptional()
  delivery_carrier?: string
}

export class CreateShippingDto {
  @IsOptional()
  payment?: string

  @IsOptional()
  delivery_address?: string

  @IsOptional()
  buyer?: string

  @IsOptional()
  seller?: string

  @IsOptional()
  status?: ShippingStatus

  @ApiPropertyOptional({
    description: 'The ID of the cart',
    format: 'uuid',
  })
  @IsUUID()
  @IsOptional()
  cart?: string

  @ApiPropertyOptional({
    description: 'The ID of the bid',
    format: 'uuid',
  })
  @IsUUID()
  @IsOptional()
  bid?: string

  @ApiProperty({
    description: 'The ID of the return address',
    format: 'uuid',
  })
  @IsUUID()
  @IsDefined()
  @IsNotEmpty()
  return_address: string

  @ApiPropertyOptional({
    description: 'The message from the buyer',
  })
  @IsString()
  @IsOptional()
  buyer_message?: string

  @ApiPropertyOptional({
    description: 'The message from the seller',
  })
  @IsString()
  @IsOptional()
  internal_message?: string

  @ApiPropertyOptional({
    description: 'The ID of the shipping origin',
    format: 'uuid',
  })
  @IsUUID()
  @IsOptional()
  shipping_origin?: string

  @ApiProperty({
    description: 'The items in the shipping',
    type: [CreateShippingItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateShippingItemDto)
  items: CreateShippingItemDto[]

  @ApiProperty({
    description: 'The tracking details',
    type: [CreateShippingTrackingDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateShippingTrackingDto)
  tracking_details?: CreateShippingTrackingDto[]
}
