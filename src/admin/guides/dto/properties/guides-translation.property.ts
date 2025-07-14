import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty, IsOptional, IsUUID, MaxLength } from 'class-validator'
import { LanguageEntity } from '@app/src/admin/languages/entities/language.entity'

export class GuidesTranslationProperty {
  @ApiProperty()
  @IsDefined()
  @IsNotEmpty()
  @MaxLength(20)
  readonly name: string

  @ApiPropertyOptional()
  @IsOptional()
  readonly description?: string

  @ApiProperty({
    format: 'uuid',
    default: '5e351da0-745e-4ea5-ac2d-670b64686b64',
  })
  @IsUUID()
  @IsDefined()
  @IsNotEmpty()
  readonly language: LanguageEntity
}
