import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty, IsUUID, MaxLength } from 'class-validator'
import { LanguageEntity } from '@app/src/admin/languages/entities/language.entity'

export class TagTranslation {
  @ApiProperty()
  @IsDefined()
  @IsNotEmpty()
  @MaxLength(20)
  readonly name: string

  @ApiProperty({
    format: 'uuid',
    default: null,
  })
  @IsUUID()
  @IsDefined()
  @IsNotEmpty()
  readonly language: LanguageEntity
}
