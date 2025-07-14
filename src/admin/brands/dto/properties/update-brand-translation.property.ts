import { IsOptional } from 'class-validator'
import { BrandTranslation } from '@app/src/admin/brands/dto/properties'
import { ApiProperty, PartialType } from '@nestjs/swagger'

export class UpdateBrandTranslation extends PartialType(BrandTranslation) {
  @ApiProperty({ format: 'uuid' })
  @IsOptional()
  readonly id: string
}
