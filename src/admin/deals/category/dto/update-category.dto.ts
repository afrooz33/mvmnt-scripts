import {
  IsDefined,
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsEnum,
  IsArray,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { DealCategoryEntity } from '@app/src/admin/deals/category/entities/deal-category.entity'
import { DealCategoryType } from '@app/src/admin/deals/category/enums'
import { IsLanguageActive } from '@app/src/shared/decorators'
import { UpdateCategoryTranslation } from './properties'

export class UpdateCategoryDto {
  @ApiProperty({ format: 'uuid' })
  @IsNotEmpty()
  @IsDefined()
  readonly id: string

  @ApiProperty({ type: 'string' })
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({ enum: DealCategoryType, required: true })
  @IsEnum(DealCategoryType)
  @IsDefined()
  readonly type: DealCategoryType

  @ApiPropertyOptional({
    type: 'string',
    format: 'uuid',
    default: null,
  })
  @IsUUID()
  @IsOptional()
  readonly parent?: DealCategoryEntity

  @ApiPropertyOptional({
    type: [UpdateCategoryTranslation],
  })
  @IsOptional()
  @IsArray()
  @IsLanguageActive({
    message: 'Invalid language',
  })
  readonly translations?: UpdateCategoryTranslation[]
}
