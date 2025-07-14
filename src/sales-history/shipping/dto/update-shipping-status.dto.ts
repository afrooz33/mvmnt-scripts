import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsUUID, IsArray, ValidateNested, IsOptional, IsString, IsNotEmpty } from 'class-validator'

export class UpdateShippingItemStatusDto {
  @ApiProperty({
    description: 'The ID of the shipping item',
    format: 'uuid',
  })
  @IsUUID()
  id: string

  @ApiProperty({
    description: 'The ID of the cart item',
    format: 'uuid',
  })
  @IsUUID()
  cart_item: string

  @ApiProperty({
    description: 'The quantity to ship',
  })
  @IsNotEmpty()
  quantity: number

  @ApiProperty({
    description: 'The ID of the shipping',
    format: 'uuid',
  })
  @IsUUID()
  shipping: string
}

export class UpdateShippingTrackingDto {
  @ApiProperty({
    description: 'The ID of the shipping',
    format: 'uuid',
  })
  @IsUUID()
  shipping: string

  @ApiProperty({
    description: 'The tracking number',
  })
  @IsString()
  tracking_number: string

  @ApiPropertyOptional({
    description: 'The ID of the delivery carrier',
  })
  @IsUUID()
  @IsOptional()
  delivery_carrier?: string
}

export class UpdateShippingStatusDto {
  @ApiProperty({
    description: 'The items to ship',
    type: [UpdateShippingItemStatusDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateShippingItemStatusDto)
  itemsToShip: UpdateShippingItemStatusDto[]

  @ApiPropertyOptional({
    description: 'The tracking details',
    type: UpdateShippingTrackingDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateShippingTrackingDto)
  tracking?: UpdateShippingTrackingDto
}
