import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { UpdateTagTranslation } from '@app/src/admin/tags/dto/properties'
import { IsDefined, IsNotEmpty, IsArray, ArrayMinSize, IsString, IsHexColor } from 'class-validator'

export class UpdateTagDto {
  @ApiProperty({ format: 'uuid' })
  readonly id: string

  @ApiProperty()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  readonly name: string

  @ApiPropertyOptional({
    description: 'Hex color code',
    example: '#000000',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsHexColor()
  readonly hex_color: string

  @ApiProperty({
    type: [UpdateTagTranslation],
  })
  @IsDefined()
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  readonly translations: UpdateTagTranslation[]
}
