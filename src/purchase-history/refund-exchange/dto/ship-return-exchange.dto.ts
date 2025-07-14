import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { IsUUID, IsArray, IsOptional, ValidateNested, IsNotEmpty } from 'class-validator'

export class ShippedItemDto {
  @ApiProperty({ required: true, format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  return_exchange_item: string

  @ApiProperty({ required: true })
  @IsNotEmpty()
  quantity: number
}

export class TrackingInfoDto {
  @ApiProperty({ required: false })
  @IsOptional()
  tracking_number?: string

  @ApiProperty({ required: false, format: 'uuid' })
  @IsUUID()
  @IsOptional()
  delivery_carrier?: string
}

export class ShipReturnExchangeDto {
  @ApiProperty({ required: true, type: [ShippedItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShippedItemDto)
  items: ShippedItemDto[]

  @ApiProperty({ required: false, type: [TrackingInfoDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TrackingInfoDto)
  tracking_info: TrackingInfoDto[] = []
}
