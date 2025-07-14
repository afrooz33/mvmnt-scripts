import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsString, IsNotEmpty, IsArray, ArrayMinSize, IsHexColor } from 'class-validator'
import { TagTranslation } from '@app/src/admin/tags/dto/properties'
import { IsLanguageActive } from '@app/src/shared/decorators'

export class CreateTagDto {
  @ApiProperty()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  readonly name: string

  @ApiProperty({
    description: 'Hex color code',
    example: '#000000',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsHexColor()
  readonly hex_color: string

  @ApiProperty({
    type: [TagTranslation],
  })
  @IsDefined()
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @IsLanguageActive({
    message: 'Invalid language',
  })
  readonly translations: TagTranslation[]
}
