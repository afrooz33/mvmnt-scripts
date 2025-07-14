import { ArrayMinSize, IsArray, IsDefined, IsNotEmpty } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { BrandTranslation } from '@app/src/admin/brands/dto/properties'
import { IsLanguageActive } from '@app/src/shared/decorators'

export class CreateBrandDto {
  @ApiProperty({ required: true })
  @IsDefined()
  readonly name: string

  @ApiProperty({
    type: [BrandTranslation],
  })
  @IsDefined()
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @IsLanguageActive({
    message: 'Invalid language',
  })
  readonly translations: BrandTranslation[]
}
