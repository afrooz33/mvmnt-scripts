import { ApiProperty } from '@nestjs/swagger'
import {
  IsString,
  IsNotEmpty,
  IsDefined,
  IsUUID,
  IsEnum,
  ArrayMinSize,
  IsArray,
  ValidateIf,
} from 'class-validator'
import { IsLanguageActive } from '@app/src/shared/decorators'
import { GuideLevel, GuideStatus } from '@app/src/admin/guides/enums'
import { GuidesEntity } from '@app/src/admin/guides/entities/guides.entity'
import { GuidesTranslationProperty } from './properties'

export class CreateGuideDto {
  @ApiProperty({ type: 'string' })
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  readonly name: string

  @ValidateIf((o) => o.level === GuideLevel.ARTICLE)
  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  readonly description: string

  @ValidateIf((o) => o.level === GuideLevel.MIDDLE)
  @ApiProperty({
    type: 'string',
    format: 'uuid',
    required: true,
    nullable: false,
  })
  @IsUUID()
  @IsDefined()
  @IsNotEmpty()
  readonly parent: GuidesEntity

  @ApiProperty({ enum: GuideLevel, required: true })
  @IsEnum(GuideLevel)
  @IsDefined()
  readonly level: GuideLevel

  @ApiProperty({ enum: GuideStatus, required: true })
  @IsEnum(GuideStatus)
  @IsDefined()
  readonly status: GuideStatus

  @ApiProperty({
    type: [GuidesTranslationProperty],
  })
  @IsDefined()
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @IsLanguageActive({
    message: 'Invalid language',
  })
  readonly translations: GuidesTranslationProperty[]
}
