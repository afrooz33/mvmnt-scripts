import { IsDefined, IsString, IsNotEmpty, IsArray, ArrayMinSize } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { UpdateBrandTranslation } from './properties'

export class UpdateBrandDto {
  @ApiProperty({ format: 'uuid' })
  @IsNotEmpty()
  @IsDefined()
  readonly id: string

  @ApiProperty()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  readonly name: string

  @ApiProperty({
    type: [UpdateBrandTranslation],
  })
  @IsDefined()
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  readonly translations: UpdateBrandTranslation[]
}
