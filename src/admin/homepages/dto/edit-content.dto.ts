import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsEnum,
  IsArray,
  IsDefined,
  MaxLength,
  IsOptional,
  IsNotEmpty,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator'
import { IsLanguageActive } from '@app/src/shared/decorators'
import {
  ContentSelection,
  HomepageEditStatus,
  HomepageContentSearchType,
} from '@app/src/admin/homepages/enums'
import { HomepageTranslationEntity } from '@app/src/admin/homepages/entities/homepages-translation.entity'
import {
  HomepageContentPropery,
  HomepageTranslationProperty,
  HomepageSearchConditionProperty,
} from './properties'

export class EditContentDto {
  @ApiPropertyOptional({
    description: 'Homepage content title',
    nullable: true,
    default: 'Top selling brands',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsOptional()
  readonly title?: string

  @ApiPropertyOptional({
    description: 'Homepage content description',
    nullable: true,
    default: 'Top selling brands',
  })
  @IsDefined()
  @IsOptional()
  @IsNotEmpty()
  @MaxLength(255)
  readonly description?: string

  @ApiPropertyOptional({
    type: [HomepageTranslationEntity],
    example: [
      {
        language: '7647ad4c-ed2b-4514-9182-f8eab3ba192b',
        title: 'Die meistverkauften Marken',
        description: 'Die meistverkauften Marken',
      },
    ],
  })
  @IsArray()
  @IsDefined()
  @IsOptional()
  @IsNotEmpty()
  @ArrayMinSize(1, { message: 'Minimum of 1 translation must be added' })
  @ArrayMaxSize(15, { message: 'Maximum of 10 translations can be added' })
  @IsLanguageActive({
    message: 'Invalid language',
  })
  readonly translations: HomepageTranslationProperty[]

  @ApiPropertyOptional({
    description: 'Homepage content ids',
    type: [HomepageContentPropery],
  })
  @IsArray()
  @IsDefined()
  @IsNotEmpty()
  @IsOptional()
  @Type(() => HomepageContentPropery)
  @ArrayMinSize(1, { message: 'Minimum of 1 content reference must be added' })
  @ArrayMaxSize(30, { message: 'Maximum of 10 content reference can be added' })
  contents: HomepageContentPropery[]

  @ApiProperty({
    description: 'Homepage content status',
    nullable: true,
    enum: Object.values(HomepageEditStatus),
  })
  @IsNotEmpty()
  @IsEnum(HomepageEditStatus)
  readonly status: HomepageEditStatus

  @ApiPropertyOptional({
    description: 'Homepage content selection type',
    nullable: true,
    enum: Object.values(ContentSelection),
  })
  @IsOptional()
  @IsEnum(ContentSelection)
  readonly selection?: ContentSelection

  @ApiPropertyOptional({
    description: 'Homepage content search type',
    nullable: true,
    enum: Object.values(HomepageContentSearchType),
  })
  @IsOptional()
  @IsEnum(HomepageContentSearchType)
  readonly search_type?: HomepageContentSearchType

  @ApiPropertyOptional({
    description: 'Homepage content search conditions',
    type: () => [HomepageSearchConditionProperty],
    nullable: true,
  })
  @IsArray()
  @IsOptional()
  @Type(() => HomepageSearchConditionProperty)
  @ArrayMinSize(1, { message: 'Minimum of 1 search condition must be added' })
  @ArrayMaxSize(10, { message: 'Maximum of 10 search condition can be added' })
  search_conditions?: HomepageSearchConditionProperty[]
}
