import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDefined,
  IsUUID,
  IsEnum,
  ArrayMinSize,
  IsArray,
} from 'class-validator'
import { DealCategoryType } from '@app/src/admin/deals/category/enums'
import { IsLanguageActive } from '@app/src/shared/decorators'
import { CategoryTranslation } from './properties'
import { DealCategoryEntity } from '@app/src/admin/deals/category/entities/deal-category.entity'

export class CreateCategoryDto {
  @ApiProperty({ type: 'string' })
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiPropertyOptional({
    type: 'string',
    format: 'uuid',
    default: null,
  })
  @IsUUID()
  @IsOptional()
  parent?: DealCategoryEntity

  @ApiProperty({ enum: DealCategoryType, required: true })
  @IsEnum(DealCategoryType)
  @IsDefined()
  readonly type: DealCategoryType

  @ApiProperty({
    type: [CategoryTranslation],
  })
  @IsDefined()
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @IsLanguageActive({
    message: 'Invalid language',
  })
  readonly translations: CategoryTranslation[]
}
