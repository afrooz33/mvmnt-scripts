import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty, IsUUID } from 'class-validator'
import { CreateProductTagDto } from './create-product-tag.dto'

export class UpdateProductTagDto extends CreateProductTagDto {
  @ApiProperty({
    description: 'The id of the product tag',
    format: 'uuid',
    example: '2d812074-34cf-407c-9fad-8e9892edde4e',
  })
  @IsUUID()
  @IsDefined()
  @IsNotEmpty()
  readonly id: string
}
