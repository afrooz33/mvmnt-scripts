import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty, IsUUID } from 'class-validator'
import { CreateCartBannerDto } from './create-cart-banner.dto'

export class UpdateCartBannerDto extends CreateCartBannerDto {
  @ApiProperty({
    description: 'Shopify integration cart banner settings id',
    type: 'string',
    format: 'uuid',
    example: '36f5ae65-dcc6-43ab-8800-7f4686247c05',
  })
  @IsUUID()
  @IsDefined()
  @IsNotEmpty()
  readonly id: string
}
