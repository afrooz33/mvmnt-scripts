import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty, IsUUID } from 'class-validator'
import { CreateSalePortionDto } from './create-sale-portion.dto'

export class UpdateSalePortionDto extends CreateSalePortionDto {
  @ApiProperty({
    description: 'Shopify integration sale portion settings id',
    type: 'string',
    format: 'uuid',
    example: '26ebf485-e955-42fd-b04c-6e8b99b99662',
  })
  @IsUUID()
  @IsDefined()
  @IsNotEmpty()
  readonly id: string
}
