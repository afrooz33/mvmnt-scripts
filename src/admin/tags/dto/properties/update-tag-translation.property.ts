import { IsOptional } from 'class-validator'
import { ApiProperty, PartialType } from '@nestjs/swagger'
import { TagTranslation } from '@app/src/admin/tags/dto/properties/tag-translation.property'

export class UpdateTagTranslation extends PartialType(TagTranslation) {
  @ApiProperty({ format: 'uuid' })
  @IsOptional()
  readonly id: string
}
