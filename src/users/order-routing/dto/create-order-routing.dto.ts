import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsUUID,
  IsEnum,
  IsArray,
  IsNotEmpty,
  IsOptional,
  ValidateIf,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator'
import { OrderRoutingType } from '@app/src/users/order-routing/enums'

class OrderRoutingOrigin {
  @ApiProperty({
    description: 'Origin id',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  readonly origin: string
}

class OrderRoutingGroup {
  @ApiProperty({
    description: 'Origins in this group',
    type: [OrderRoutingOrigin],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderRoutingOrigin)
  readonly origins: OrderRoutingOrigin[]
}

export class CreateOrderRoutingDto {
  @ApiProperty({
    enum: Object.values(OrderRoutingType),
    description: 'Order routing type',
  })
  @IsNotEmpty()
  @IsEnum(OrderRoutingType)
  readonly type: OrderRoutingType

  @ApiPropertyOptional({
    description: 'Ranked origin groups',
    type: [OrderRoutingGroup],
  })
  @IsArray()
  @IsOptional()
  @Type(() => OrderRoutingGroup)
  @ValidateNested({ each: true })
  @ValidateIf((o) => o.type === OrderRoutingType.USE_RANKED_SHIPPING_ORIGINS)
  readonly origin_groups?: OrderRoutingGroup[]
}
