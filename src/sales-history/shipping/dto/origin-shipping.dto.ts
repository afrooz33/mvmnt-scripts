import { IsString, IsNotEmpty, IsNumber, IsOptional, Min, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

export class ShippingOriginItemDto {
  @IsString()
  @IsNotEmpty()
  originId: string

  @IsNumber()
  @Min(1)
  quantity: number
}

export class CartItemWithOriginDto {
  @IsString()
  @IsNotEmpty()
  cart_item: string

  @ValidateNested({ each: true })
  @Type(() => ShippingOriginItemDto)
  origins: ShippingOriginItemDto[]
}

export class BidWithOriginDto {
  @ValidateNested({ each: true })
  @Type(() => ShippingOriginItemDto)
  origins: ShippingOriginItemDto[]
}

export class TrackingDetailsDto {
  @IsString()
  @IsNotEmpty()
  tracking_number: string

  @IsString()
  @IsNotEmpty()
  delivery_carrier: string
}

export class OriginShippingDto {
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CartItemWithOriginDto)
  cartItems?: CartItemWithOriginDto[]

  @IsOptional()
  @ValidateNested()
  @Type(() => BidWithOriginDto)
  bid?: BidWithOriginDto

  @IsOptional()
  @ValidateNested()
  @Type(() => TrackingDetailsDto)
  tracking?: TrackingDetailsDto

  @IsString()
  @IsOptional()
  internal_message?: string

  @IsString()
  @IsOptional()
  buyer_message?: string
}
