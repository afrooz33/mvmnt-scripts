import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty, IsOptional, IsUUID, MaxLength } from 'class-validator'
import { LanguageEntity } from '@app/src/admin/languages/entities/language.entity'

export class HomepageTranslationProperty {
  @ApiPropertyOptional({
    format: 'uuid',
    default: null,
  })
  @IsUUID()
  @IsOptional()
  readonly id: string

  @ApiProperty()
  @IsDefined()
  @IsNotEmpty()
  @MaxLength(20)
  readonly title: string

  @ApiPropertyOptional()
  @IsOptional()
  @MaxLength(255)
  readonly description: string

  @ApiProperty({
    format: 'uuid',
    default: null,
  })
  @IsUUID()
  @IsDefined()
  @IsNotEmpty()
  readonly language: LanguageEntity
}
