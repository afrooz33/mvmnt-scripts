import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty } from 'class-validator'

export class DrawerSettingDto {
  @ApiProperty({
    description: 'The shopify shop domain',
    example: 'shopify.myshopify.com',
  })
  @IsDefined()
  @IsNotEmpty()
  readonly shop: string
}
